#!/usr/bin/env python3
"""Strict, dependency-light SVG preflight and render checker.

Usage:
    python svg_preflight.py input.svg --render preview.png --strict

Exit codes:
    0: no errors (warnings may exist without --strict)
    1: validation or render errors
"""

from __future__ import annotations

import argparse
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse

from lxml import etree

SVG_NS = "http://www.w3.org/2000/svg"
ALLOWED_NAMED_ENTITIES = {"amp", "lt", "gt", "quot", "apos"}
FORBIDDEN_ELEMENTS = {"script", "foreignObject"}
REFERENCE_ATTRS = {
    "fill",
    "stroke",
    "filter",
    "clip-path",
    "mask",
    "marker-start",
    "marker-mid",
    "marker-end",
    "href",
    "{http://www.w3.org/1999/xlink}href",
}
NUMERIC_ATTRS = {
    "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
    "width", "height", "dx", "dy", "font-size", "stroke-width", "opacity",
    "fill-opacity", "stroke-opacity", "offset",
}
BAD_NUMERIC_TOKENS = re.compile(r"(?i)(?:^|[^A-Za-z])(nan|infinity|undefined|null)(?:$|[^A-Za-z])")
NAMED_ENTITY_RE = re.compile(r"&([A-Za-z][A-Za-z0-9]+);")
URL_REF_RE = re.compile(r"url\(\s*#([^)\s]+)\s*\)")
LOCAL_HREF_RE = re.compile(r"^#(.+)$")
NUMBER_RE = re.compile(r"^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?(?:px|pt|pc|mm|cm|in|em|ex|%)?$")


def local_name(tag: str) -> str:
    return etree.QName(tag).localname if isinstance(tag, str) else ""


def parse_viewbox(value: str | None) -> tuple[float, float, float, float] | None:
    if not value:
        return None
    parts = re.split(r"[\s,]+", value.strip())
    if len(parts) != 4:
        return None
    try:
        vals = tuple(float(v) for v in parts)
    except ValueError:
        return None
    if not all(math.isfinite(v) for v in vals):
        return None
    if vals[2] <= 0 or vals[3] <= 0:
        return None
    return vals  # type: ignore[return-value]


def is_external_reference(value: str) -> bool:
    value = value.strip()
    if not value or value.startswith("#") or value.startswith("url(#") or value.startswith("data:"):
        return False
    parsed = urlparse(value)
    return bool(parsed.scheme or parsed.netloc) or value.startswith("//")


def iter_text_content(root: etree._Element) -> Iterable[tuple[etree._Element, str]]:
    for el in root.iter():
        if local_name(el.tag) in {"text", "tspan", "title", "desc"}:
            text = "".join(el.itertext())
            yield el, text


def validate(path: Path) -> tuple[list[str], list[str], etree._Element | None]:
    errors: list[str] = []
    warnings: list[str] = []

    try:
        raw_bytes = path.read_bytes()
    except OSError as exc:
        return [f"无法读取文件：{exc}"], warnings, None

    try:
        raw_text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        errors.append(f"文件不是有效 UTF-8：{exc}")
        return errors, warnings, None

    for match in NAMED_ENTITY_RE.finditer(raw_text):
        entity = match.group(1)
        if entity not in ALLOWED_NAMED_ENTITIES:
            line = raw_text.count("\n", 0, match.start()) + 1
            errors.append(
                f"第 {line} 行使用未定义的 XML 命名实体 '&{entity};'。"
                "请改用坐标布局、UTF-8 字符或数字字符引用。"
            )

    if BAD_NUMERIC_TOKENS.search(raw_text):
        errors.append("文件包含 NaN、Infinity、undefined 或 null 等非法值。")

    parser = etree.XMLParser(
        resolve_entities=False,
        no_network=True,
        recover=False,
        remove_comments=False,
        huge_tree=False,
    )
    try:
        root = etree.fromstring(raw_bytes, parser=parser)
    except etree.XMLSyntaxError as exc:
        errors.append(f"XML 解析失败：{exc}")
        return errors, warnings, None

    if local_name(root.tag) != "svg":
        errors.append("根元素不是 <svg>。")
    elif etree.QName(root.tag).namespace != SVG_NS:
        errors.append(f"SVG 根元素缺少正确命名空间 xmlns=\"{SVG_NS}\"。")

    viewbox = parse_viewbox(root.get("viewBox"))
    if viewbox is None:
        errors.append("缺少合法 viewBox；格式应为 'minX minY width height'，宽高必须大于 0。")

    if not root.get("width") or not root.get("height"):
        warnings.append("根元素建议同时提供 width 和 height，便于独立预览。")

    ids: dict[str, etree._Element] = {}
    duplicate_ids: set[str] = set()

    for el in root.iter():
        name = local_name(el.tag)
        if name in FORBIDDEN_ELEMENTS:
            errors.append(f"禁止元素 <{name}>。独立 SVG 不应依赖脚本或 HTML foreignObject。")

        el_id = el.get("id")
        if el_id:
            if el_id in ids:
                duplicate_ids.add(el_id)
            else:
                ids[el_id] = el

        for attr_name, attr_value in el.attrib.items():
            if BAD_NUMERIC_TOKENS.search(attr_value):
                errors.append(f"元素 <{name}> 的属性 {attr_name!r} 含非法值：{attr_value!r}")

            simple_attr = etree.QName(attr_name).localname if attr_name.startswith("{") else attr_name
            if simple_attr in NUMERIC_ATTRS and attr_value.strip():
                # Lists are allowed for dx/dy, but each token must be numeric.
                tokens = re.split(r"[\s,]+", attr_value.strip())
                for token in tokens:
                    if token and not NUMBER_RE.match(token):
                        warnings.append(
                            f"元素 <{name}> 的数值属性 {simple_attr!r} 可能无效：{attr_value!r}"
                        )
                        break

            if attr_name in REFERENCE_ATTRS or simple_attr in REFERENCE_ATTRS:
                for ref in URL_REF_RE.findall(attr_value):
                    if ref not in ids:
                        # IDs defined later are checked in the second pass.
                        pass
                if simple_attr == "href" and is_external_reference(attr_value):
                    errors.append(f"元素 <{name}> 使用外部引用：{attr_value!r}")

        style = el.get("style", "")
        if "@import" in style or re.search(r"url\(\s*['\"]?(?:https?:)?//", style):
            errors.append(f"元素 <{name}> 的 style 包含外部资源。")

    if duplicate_ids:
        errors.append("存在重复 id：" + ", ".join(sorted(duplicate_ids)))

    # Second pass: validate references after collecting all IDs.
    for el in root.iter():
        name = local_name(el.tag)
        for attr_name, attr_value in el.attrib.items():
            simple_attr = etree.QName(attr_name).localname if attr_name.startswith("{") else attr_name
            if attr_name in REFERENCE_ATTRS or simple_attr in REFERENCE_ATTRS:
                for ref in URL_REF_RE.findall(attr_value):
                    if ref not in ids:
                        errors.append(f"元素 <{name}> 引用了不存在的 id '#{ref}'。")
                href_match = LOCAL_HREF_RE.match(attr_value.strip())
                if simple_attr == "href" and href_match and href_match.group(1) not in ids:
                    errors.append(
                        f"元素 <{name}> 的 href 引用了不存在的 id '#{href_match.group(1)}'。"
                    )

    for el, text in iter_text_content(root):
        if "\t" in text:
            warnings.append(f"<{local_name(el.tag)}> 中含制表符；不要依赖 tab 进行 SVG 布局。")
        if "  " in text and el.get("xml:space") != "preserve":
            warnings.append(
                f"<{local_name(el.tag)}> 中含连续空格；SVG/XML 可能折叠空白，请使用 x/dx 对齐。"
            )

    # Basic accessibility check.
    title_count = sum(1 for el in root.iter() if local_name(el.tag) == "title")
    if title_count == 0:
        warnings.append("建议添加 <title>，用于可访问性和文件说明。")

    return errors, warnings, root


def render_svg(svg_path: Path, png_path: Path, renderer: str = "auto") -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    png_path.parent.mkdir(parents=True, exist_ok=True)

    selected = renderer
    if selected == "auto":
        selected = "inkscape" if shutil.which("inkscape") else "cairosvg"

    if selected == "inkscape":
        inkscape = shutil.which("inkscape")
        if not inkscape:
            errors.append("未找到 Inkscape。请安装 Inkscape，或使用 --renderer cairosvg。")
            return errors, warnings
        command = [
            inkscape,
            str(svg_path),
            "--export-type=png",
            f"--export-filename={png_path}",
        ]
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=120)
        except (OSError, subprocess.SubprocessError) as exc:
            errors.append(f"Inkscape 渲染失败：{exc}")
            return errors, warnings
        if result.returncode != 0 or not png_path.exists():
            detail = (result.stderr or result.stdout).strip()
            errors.append(f"Inkscape 渲染失败：{detail or '未生成 PNG'}")
            return errors, warnings
    elif selected == "cairosvg":
        try:
            import cairosvg
        except ImportError:
            errors.append("未安装 CairoSVG，无法执行渲染验证。请安装 cairosvg。")
            return errors, warnings
        try:
            cairosvg.svg2png(url=str(svg_path), write_to=str(png_path))
        except Exception as exc:  # CairoSVG surfaces several exception types.
            errors.append(f"CairoSVG 渲染失败：{exc}")
            return errors, warnings
    else:
        errors.append(f"未知渲染器：{renderer!r}")
        return errors, warnings

    try:
        from PIL import Image

        with Image.open(png_path) as im:
            if im.width <= 0 or im.height <= 0:
                errors.append("渲染出的 PNG 尺寸无效。")
                return errors, warnings
            rgba = im.convert("RGBA")
            alpha = rgba.getchannel("A")
            bbox = alpha.getbbox()
            if bbox is None:
                warnings.append("渲染结果完全透明，可能没有可见内容。")
            else:
                left, top, right, bottom = bbox
                corners = [
                    alpha.getpixel((0, 0)),
                    alpha.getpixel((im.width - 1, 0)),
                    alpha.getpixel((0, im.height - 1)),
                    alpha.getpixel((im.width - 1, im.height - 1)),
                ]
                full_canvas_background = (
                    left == 0 and top == 0 and right == im.width and bottom == im.height
                    and all(value > 0 for value in corners)
                )
                if not full_canvas_background and (
                    left <= 1 or top <= 1 or right >= im.width - 1 or bottom >= im.height - 1
                ):
                    warnings.append("可见内容接近或接触画布边缘，可能存在裁切风险。")
    except ImportError:
        warnings.append("未安装 Pillow，跳过 PNG 边界检查。")
    except Exception as exc:
        warnings.append(f"PNG 边界检查失败：{exc}")

    return errors, warnings


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate and optionally render a standalone SVG.")
    parser.add_argument("svg", type=Path, help="SVG file to validate")
    parser.add_argument("--render", type=Path, help="Render the SVG to this PNG path")
    parser.add_argument(
        "--renderer",
        choices=("auto", "inkscape", "cairosvg"),
        default="auto",
        help="PNG renderer; auto prefers Inkscape and falls back to CairoSVG",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Treat warnings as failures; recommended before final delivery",
    )
    args = parser.parse_args()

    errors, warnings, _ = validate(args.svg)

    if args.render and not errors:
        render_errors, render_warnings = render_svg(args.svg, args.render, args.renderer)
        errors.extend(render_errors)
        warnings.extend(render_warnings)

    for item in errors:
        print(f"ERROR: {item}", file=sys.stderr)
    for item in warnings:
        print(f"WARNING: {item}", file=sys.stderr)

    if errors:
        print(f"FAIL: {len(errors)} error(s), {len(warnings)} warning(s)", file=sys.stderr)
        return 1
    if args.strict and warnings:
        print(f"FAIL (strict): {len(warnings)} warning(s)", file=sys.stderr)
        return 1

    render_note = f", rendered to {args.render} with {args.renderer}" if args.render else ""
    print(f"PASS: valid standalone SVG{render_note}; {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
