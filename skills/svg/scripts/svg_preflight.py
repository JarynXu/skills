#!/usr/bin/env python3
"""Validate a standalone SVG and optionally render a PNG preview.

Usage:
    python svg_preflight.py input.svg --strict
    python svg_preflight.py input.svg --render preview.png --strict

Exit codes:
    0: no errors (and no warnings in strict mode)
    1: validation, renderer, or render failure
"""

from __future__ import annotations

import argparse
import base64
import binascii
from dataclasses import dataclass
from importlib import import_module
from io import BytesIO
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import time
from typing import Iterable
from urllib.parse import unquote, unquote_to_bytes

from lxml import etree

SVG_NS = "http://www.w3.org/2000/svg"
XML_NS = "http://www.w3.org/XML/1998/namespace"
ALLOWED_NAMED_ENTITIES = {"amp", "lt", "gt", "quot", "apos"}
FORBIDDEN_ELEMENTS = {"foreignobject", "script"}
SMIL_ELEMENTS = {
    "animate",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "discard",
    "set",
}
TEXT_ELEMENTS = {"desc", "text", "title", "tspan"}
ARIA_IDREF_ATTRS = {"aria-describedby", "aria-labelledby"}
URL_FUNCTION_ATTRS = {
    "clip-path",
    "color-profile",
    "cursor",
    "fill",
    "filter",
    "marker",
    "marker-end",
    "marker-mid",
    "marker-start",
    "mask",
    "stroke",
    "style",
}
PAINT_SERVER_ELEMENTS = {
    "hatch",
    "linearGradient",
    "mesh",
    "meshgradient",
    "pattern",
    "radialGradient",
    "solidcolor",
}
REFERENCE_TARGET_TYPES = {
    "clip-path": {"clipPath"},
    "color-profile": {"color-profile"},
    "cursor": {"cursor"},
    "fill": PAINT_SERVER_ELEMENTS,
    "filter": {"filter"},
    "marker": {"marker"},
    "marker-end": {"marker"},
    "marker-mid": {"marker"},
    "marker-start": {"marker"},
    "mask": {"mask"},
    "stroke": PAINT_SERVER_ELEMENTS,
}
HREF_TARGET_TYPES = {
    "filter": {"filter"},
    "linearGradient": {"linearGradient", "radialGradient"},
    "marker": {"marker"},
    "mpath": {"path"},
    "pattern": {"pattern"},
    "radialGradient": {"linearGradient", "radialGradient"},
    "textPath": {"path"},
}
NUMERIC_ATTRS = {
    "baseFrequency",
    "cx",
    "cy",
    "dx",
    "dy",
    "fill-opacity",
    "font-size",
    "fx",
    "fy",
    "height",
    "markerHeight",
    "markerWidth",
    "opacity",
    "offset",
    "pathLength",
    "r",
    "refX",
    "refY",
    "rx",
    "ry",
    "stdDeviation",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-opacity",
    "stroke-width",
    "width",
    "x",
    "x1",
    "x2",
    "y",
    "y1",
    "y2",
}
NONNEGATIVE_ATTRS = {
    "height",
    "markerHeight",
    "markerWidth",
    "pathLength",
    "r",
    "rx",
    "ry",
    "stroke-width",
    "width",
}
UNIT_INTERVAL_ATTRS = {"fill-opacity", "opacity", "stroke-opacity"}
STRUCTURED_NUMERIC_ATTRS = {"d", "points", "style", "transform", "viewBox"}
TRANSFORM_ATTRS = {"gradientTransform", "patternTransform", "transform"}
CSS_FINITE_NUMBER_PROPERTIES = {attribute.lower() for attribute in NUMERIC_ATTRS} | {
    "transform",
    "transform-origin",
}
SAFE_DATA_IMAGE_TYPES = {
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/webp",
}
PILLOW_FORMAT_MEDIA_TYPES = {
    "AVIF": "image/avif",
    "GIF": "image/gif",
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}
MAX_EMBEDDED_RESOURCE_BYTES = 5_000_000
MAX_RENDER_DIMENSION = 16_384
MAX_RENDER_PIXELS = 32_000_000
PIXELS_PER_UNIT = {
    "": 1.0,
    "px": 1.0,
    "pt": 96.0 / 72.0,
    "pc": 16.0,
    "mm": 96.0 / 25.4,
    "cm": 96.0 / 2.54,
    "in": 96.0,
    "em": 16.0,
    "ex": 8.0,
}
PATH_PARAMETER_COUNTS = {
    "a": 7,
    "c": 6,
    "h": 1,
    "l": 2,
    "m": 2,
    "q": 4,
    "s": 4,
    "t": 2,
    "v": 1,
}
TRANSFORM_ARGUMENT_COUNTS = {
    "matrix": {6},
    "rotate": {1, 3},
    "scale": {1, 2},
    "skewX": {1},
    "skewY": {1},
    "translate": {1, 2},
}

BAD_VALUE_TOKEN_RE = re.compile(
    r"(?i)(?:^|[^A-Za-z])(nan|infinity|undefined|null)(?:$|[^A-Za-z])"
)
NAMED_ENTITY_RE = re.compile(r"&([A-Za-z][A-Za-z0-9]+);")
XML_LITERAL_RE = re.compile(r"<!--.*?-->|<!\[CDATA\[.*?\]\]>", re.DOTALL)
XML_STYLESHEET_RE = re.compile(r"<\?xml-stylesheet\b", re.IGNORECASE)
LENGTH_RE = re.compile(
    r"^([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)"
    r"(px|pt|pc|mm|cm|in|em|ex|%)?$"
)
NUMBER_TOKEN_RE = re.compile(
    r"[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?"
)
TRANSFORM_FUNCTION_RE = re.compile(r"([A-Za-z][A-Za-z0-9]*)\s*\(([^()]*)\)")
TRANSFORM_VALUE_RE = re.compile(
    r"([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?)"
    r"(px|pt|pc|mm|cm|in|em|ex|%|deg|grad|rad|turn)?",
    re.IGNORECASE,
)
CSS_URL_RE = re.compile(
    r"url\(\s*(?:\"([^\"]*)\"|'([^']*)'|([^\"')]*))\s*\)",
    re.IGNORECASE,
)
CSS_IMPORT_RE = re.compile(r"@import\b", re.IGNORECASE)
CSS_FONT_FACE_RE = re.compile(r"@font-face\b", re.IGNORECASE)
CSS_STRING_RESOURCE_FUNCTIONS = {"image", "image-set", "-webkit-image-set"}
CSS_DECLARATION_RE = re.compile(
    r"(?P<property>[-_A-Za-z][-_A-Za-z0-9]*)\s*:\s*(?P<value>[^;{}]+)"
)
MARKDOWN_FENCE_RE = re.compile(r"^```(?:xml|svg)?\s*$", re.IGNORECASE)
SPECIAL_SPACING_CHARACTERS = {"\u00a0", "\u2002", "\u2003"}


@dataclass(frozen=True)
class ValidationReport:
    errors: tuple[str, ...]
    warnings: tuple[str, ...]
    root: etree._Element | None


@dataclass(frozen=True)
class RendererSpec:
    name: str
    executable: str | None = None
    module: object | None = None


@dataclass(frozen=True)
class RenderReport:
    errors: tuple[str, ...]
    warnings: tuple[str, ...]
    renderer: str | None


class Issues:
    """Collect ordered, deduplicated diagnostics."""

    def __init__(self) -> None:
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self._error_set: set[str] = set()
        self._warning_set: set[str] = set()

    def error(self, message: str) -> None:
        if message not in self._error_set:
            self._error_set.add(message)
            self.errors.append(message)

    def warning(self, message: str) -> None:
        if message not in self._warning_set:
            self._warning_set.add(message)
            self.warnings.append(message)

    def report(self, root: etree._Element | None) -> ValidationReport:
        return ValidationReport(tuple(self.errors), tuple(self.warnings), root)


def local_name(tag: str) -> str:
    return etree.QName(tag).localname if isinstance(tag, str) else ""


def element_label(element: etree._Element) -> str:
    name = local_name(element.tag)
    element_id = element.get("id")
    return f"<{name} id={element_id!r}>" if element_id else f"<{name}>"


def parse_viewbox(value: str | None) -> tuple[float, float, float, float] | None:
    if not value:
        return None
    matches, invalid_fragment = tokenize_numeric_sequence(value, NUMBER_TOKEN_RE)
    if invalid_fragment is not None or len(matches) != 4:
        return None
    values = tuple(float(match.group(0)) for match in matches)
    if not all(math.isfinite(value) for value in values):
        return None
    if values[2] <= 0 or values[3] <= 0:
        return None
    return values  # type: ignore[return-value]


def parse_length(value: str | None) -> tuple[float, str] | None:
    if value is None:
        return None
    match = LENGTH_RE.fullmatch(value.strip())
    if not match:
        return None
    number = float(match.group(1))
    if not math.isfinite(number):
        return None
    return number, match.group(2) or ""


def mask_xml_literals(raw_text: str) -> str:
    def mask(match: re.Match[str]) -> str:
        return re.sub(r"[^\n]", " ", match.group(0))

    return XML_LITERAL_RE.sub(mask, raw_text)


def strip_css_comments(css: str) -> str:
    """Mask CSS comments while preserving strings and source positions."""
    output: list[str] = []
    position = 0
    quote: str | None = None
    while position < len(css):
        character = css[position]
        if quote is not None:
            output.append(character)
            if character == "\\" and position + 1 < len(css):
                position += 1
                output.append(css[position])
            elif character == quote:
                quote = None
            position += 1
            continue

        if character in {'"', "'"}:
            quote = character
            output.append(character)
            position += 1
            continue
        if character == "/" and position + 1 < len(css) and css[position + 1] == "*":
            output.extend("  ")
            position += 2
            while position < len(css):
                if css[position] == "*" and position + 1 < len(css) and css[position + 1] == "/":
                    output.extend("  ")
                    position += 2
                    break
                output.append("\n" if css[position] == "\n" else " ")
                position += 1
            continue

        output.append(character)
        position += 1
    return "".join(output)


def css_string_is_url_argument(css: str, quote_position: int) -> bool:
    prefix = css[:quote_position]
    return re.search(r"(?i)url\(\s*$", prefix) is not None


def mask_css_strings(css: str, preserve_url_arguments: bool) -> str:
    """Mask ordinary CSS strings, optionally retaining quoted url() arguments."""
    output: list[str] = []
    position = 0
    while position < len(css):
        character = css[position]
        if character not in {'"', "'"}:
            output.append(character)
            position += 1
            continue

        quote = character
        preserve = preserve_url_arguments and css_string_is_url_argument(css, position)
        output.append(character if preserve else " ")
        position += 1
        while position < len(css):
            character = css[position]
            if character == "\\" and position + 1 < len(css):
                output.append(character if preserve else " ")
                position += 1
                escaped = css[position]
                output.append(escaped if preserve else ("\n" if escaped == "\n" else " "))
                position += 1
                continue
            if character == quote:
                output.append(character if preserve else " ")
                position += 1
                break
            output.append(character if preserve else ("\n" if character == "\n" else " "))
            position += 1
    return "".join(output)


def decode_css_escapes(css: str) -> str:
    """Decode CSS escapes sufficiently for security-sensitive keyword scanning."""
    output: list[str] = []
    position = 0
    while position < len(css):
        if css[position] != "\\":
            output.append(css[position])
            position += 1
            continue

        position += 1
        if position >= len(css):
            output.append("\ufffd")
            break
        if css[position] in "\r\n\f":
            if css[position] == "\r" and position + 1 < len(css) and css[position + 1] == "\n":
                position += 1
            position += 1
            continue

        hex_start = position
        while (
            position < len(css)
            and position - hex_start < 6
            and css[position] in "0123456789abcdefABCDEF"
        ):
            position += 1
        if position > hex_start:
            codepoint = int(css[hex_start:position], 16)
            if position < len(css) and css[position] in " \t\r\n\f":
                if css[position] == "\r" and position + 1 < len(css) and css[position + 1] == "\n":
                    position += 1
                position += 1
            if codepoint == 0 or 0xD800 <= codepoint <= 0xDFFF or codepoint > 0x10FFFF:
                output.append("\ufffd")
            else:
                output.append(chr(codepoint))
            continue

        output.append(css[position])
        position += 1

    return "".join(output)


def consume_css_escape(css: str, position: int) -> tuple[str, int]:
    """Consume one CSS escape beginning at position and return its decoded value."""
    position += 1
    if position >= len(css):
        return "\ufffd", position
    if css[position] in "\r\n\f":
        if css[position] == "\r" and position + 1 < len(css) and css[position + 1] == "\n":
            position += 1
        return "", position + 1

    hex_start = position
    while (
        position < len(css)
        and position - hex_start < 6
        and css[position] in "0123456789abcdefABCDEF"
    ):
        position += 1
    if position > hex_start:
        codepoint = int(css[hex_start:position], 16)
        if position < len(css) and css[position] in " \t\r\n\f":
            if css[position] == "\r" and position + 1 < len(css) and css[position + 1] == "\n":
                position += 1
            position += 1
        if codepoint == 0 or 0xD800 <= codepoint <= 0xDFFF or codepoint > 0x10FFFF:
            return "\ufffd", position
        return chr(codepoint), position

    return css[position], position + 1


def consume_css_string(css: str, position: int) -> tuple[str, int, bool]:
    """Consume a quoted CSS string, decoding escapes without losing boundaries."""
    quote = css[position]
    output: list[str] = []
    position += 1
    while position < len(css):
        character = css[position]
        if character == quote:
            return "".join(output), position + 1, False
        if character in "\r\n\f":
            return "".join(output), position, True
        if character == "\\":
            decoded, position = consume_css_escape(css, position)
            output.append(decoded)
            continue
        output.append(character)
        position += 1
    return "".join(output), position, True


def css_identifier_start(character: str) -> bool:
    return character.isalpha() or character in {"-", "_", "\\"} or ord(character) >= 0x80


def consume_css_identifier(css: str, position: int) -> tuple[str, int]:
    output: list[str] = []
    while position < len(css):
        character = css[position]
        if character == "\\":
            decoded, position = consume_css_escape(css, position)
            output.append(decoded)
            continue
        if character.isalnum() or character in {"-", "_"} or ord(character) >= 0x80:
            output.append(character)
            position += 1
            continue
        break
    return "".join(output), position


def consume_css_image_set(
    css: str,
    position: int,
) -> tuple[list[str], int, bool, bool]:
    """Collect top-level string sources from one CSS image function."""
    targets: list[str] = []
    depth = 1
    option_start = True
    indirect_source = False
    while position < len(css):
        character = css[position]
        if character in {'"', "'"}:
            value, position, malformed = consume_css_string(css, position)
            if malformed:
                return targets, position, True, indirect_source
            if depth == 1 and option_start:
                targets.append(value)
            if depth == 1:
                option_start = False
            continue
        if css_identifier_start(character):
            identifier, identifier_end = consume_css_identifier(css, position)
            cursor = identifier_end
            while cursor < len(css) and css[cursor].isspace():
                cursor += 1
            if identifier.lower() in {"attr", "env", "var"} and (
                cursor < len(css) and css[cursor] == "("
            ):
                indirect_source = True
            if depth == 1 and option_start:
                option_start = False
            position = max(identifier_end, position + 1)
            continue
        if character == "(":
            depth += 1
            position += 1
            continue
        if character == ")":
            depth -= 1
            position += 1
            if depth == 0:
                return targets, position, False, indirect_source
            continue
        if depth == 1 and character == ",":
            option_start = True
            position += 1
            continue
        if depth == 1 and not character.isspace() and option_start:
            option_start = False
        position += 1
    return targets, position, True, indirect_source


def extract_css_image_set_targets(css: str) -> tuple[list[str], bool, bool]:
    targets: list[str] = []
    malformed = False
    indirect_source = False
    position = 0
    while position < len(css):
        character = css[position]
        if character in {'"', "'"}:
            _, position, string_malformed = consume_css_string(css, position)
            malformed = malformed or string_malformed
            continue
        if not css_identifier_start(character):
            position += 1
            continue

        identifier, identifier_end = consume_css_identifier(css, position)
        cursor = identifier_end
        while cursor < len(css) and css[cursor].isspace():
            cursor += 1
        if identifier.lower() in CSS_STRING_RESOURCE_FUNCTIONS and (
            cursor < len(css) and css[cursor] == "("
        ):
            found, position, function_malformed, function_indirect = consume_css_image_set(
                css,
                cursor + 1,
            )
            targets.extend(found)
            malformed = malformed or function_malformed
            indirect_source = indirect_source or function_indirect
            continue
        position = max(identifier_end, position + 1)
    return targets, malformed, indirect_source


def inside_svg_metadata(element: etree._Element) -> bool:
    parent = element.getparent()
    while parent is not None:
        if local_name(parent.tag) == "metadata" and etree.QName(parent.tag).namespace == SVG_NS:
            return True
        parent = parent.getparent()
    return False


def text_segments(root: etree._Element) -> Iterable[tuple[etree._Element, str]]:
    for element in root.iter():
        if local_name(element.tag) not in TEXT_ELEMENTS:
            continue
        if element.text and element.text.strip():
            yield element, element.text
        for child in element:
            if child.tail and child.tail.strip():
                yield element, child.tail


def preserves_space(element: etree._Element) -> bool:
    current: etree._Element | None = element
    attribute = f"{{{XML_NS}}}space"
    while current is not None:
        value = current.get(attribute)
        if value == "preserve":
            return True
        if value == "default":
            return False
        current = current.getparent()
    return False


def validate_root_length(
    root: etree._Element,
    attribute: str,
    viewbox_extent: float | None,
    issues: Issues,
) -> None:
    raw_value = root.get(attribute)
    if raw_value is None:
        issues.error(f"根元素缺少 {attribute}。")
        return
    parsed = parse_length(raw_value)
    if parsed is None:
        issues.error(f"根元素 {attribute} 不是合法绝对长度：{raw_value!r}。")
        return
    number, unit = parsed
    if number <= 0:
        issues.error(f"根元素 {attribute} 必须大于 0：{raw_value!r}。")
        return
    if unit == "%":
        issues.error(f"根元素 {attribute} 不得使用百分比：{raw_value!r}。")
        return
    if unit not in {"", "px"}:
        issues.warning(
            f"根元素 {attribute} 使用 {unit!r} 单位；独立预览在不同渲染器中可能换算不同。"
        )
    if viewbox_extent is not None and unit in {"", "px"} and not math.isclose(
        number, viewbox_extent, rel_tol=1e-9, abs_tol=1e-9
    ):
        issues.warning(
            f"根元素 {attribute}={raw_value!r} 与 viewBox 对应尺寸 {viewbox_extent:g} 不一致。"
        )


def validate_numeric_attribute(
    element: etree._Element,
    attribute: str,
    value: str,
    issues: Issues,
) -> None:
    label = element_label(element)
    if not value.strip():
        issues.error(f"{label} 的数值属性 {attribute!r} 为空。")
        return

    tokens = re.split(r"[\s,]+", value.strip())
    parsed_tokens: list[tuple[float, str]] = []
    for token in tokens:
        parsed = parse_length(token)
        if parsed is None:
            numeric_match = LENGTH_RE.fullmatch(token)
            if numeric_match and not math.isfinite(float(numeric_match.group(1))):
                issues.error(f"{label} 的数值属性 {attribute!r} 含非有限值：{token!r}。")
            else:
                issues.warning(f"{label} 的数值属性 {attribute!r} 可能无效：{value!r}。")
            return
        parsed_tokens.append(parsed)

    if attribute in NONNEGATIVE_ATTRS and any(number < 0 for number, _ in parsed_tokens):
        issues.error(f"{label} 的 {attribute!r} 不得为负数：{value!r}。")
    if attribute in UNIT_INTERVAL_ATTRS:
        for number, unit in parsed_tokens:
            normalized = number / 100 if unit == "%" else number
            if normalized < 0 or normalized > 1:
                issues.warning(f"{label} 的 {attribute!r} 超出 0–1 范围：{value!r}。")
                break


def skip_path_whitespace(value: str, position: int) -> int:
    while position < len(value) and value[position] in " \t\r\n":
        position += 1
    return position


def tokenize_path_data(path_data: str) -> tuple[list[str], str | None]:
    """Tokenize path data while honoring compact elliptical-arc flags."""
    tokens: list[str] = []
    position = 0
    command: str | None = None
    parameter_index = 0
    previous_was_parameter = False

    while position < len(path_data):
        position = skip_path_whitespace(path_data, position)
        if position >= len(path_data):
            break

        if path_data[position] == ",":
            if not previous_was_parameter:
                return tokens, "逗号没有位于两个路径参数之间"
            position = skip_path_whitespace(path_data, position + 1)
            if position >= len(path_data) or path_data[position] == ",":
                return tokens, "路径参数分隔符后缺少数值"
            if path_data[position] in "AaCcHhLlMmQqSsTtVvZz":
                return tokens, "路径命令前存在多余逗号"
            previous_was_parameter = False

        character = path_data[position]
        if character in "AaCcHhLlMmQqSsTtVvZz":
            tokens.append(character)
            command = character.lower()
            parameter_index = 0
            previous_was_parameter = False
            position += 1
            continue

        if command is None or command == "z":
            return tokens, f"数值 {path_data[position:position + 12]!r} 前缺少路径命令"

        if command == "a" and parameter_index % 7 in {3, 4}:
            if character not in {"0", "1"}:
                return tokens, f"圆弧标志位必须为 0 或 1，实际为 {character!r}"
            token = character
            position += 1
        else:
            match = NUMBER_TOKEN_RE.match(path_data, position)
            if match is None:
                return tokens, path_data[position : position + 12]
            token = match.group(0)
            position = match.end()

        tokens.append(token)
        parameter_index += 1
        previous_was_parameter = True

    return tokens, None


def finite_number(token: str) -> float | None:
    try:
        value = float(token)
    except ValueError:
        return None
    return value if math.isfinite(value) else None


def validate_path_data(element: etree._Element, path_data: str, issues: Issues) -> None:
    label = element_label(element)
    if not path_data.strip():
        issues.error(f"{label} 的路径数据 'd' 为空。")
        return

    tokens, invalid_fragment = tokenize_path_data(path_data)
    if invalid_fragment is not None:
        issues.error(f"{label} 的路径数据含非法片段：{invalid_fragment!r}。")
        return
    if not tokens or tokens[0] not in {"M", "m"}:
        issues.error(f"{label} 的路径必须以 M 或 m 命令开始。")
        return
    for token in tokens:
        if token in "AaCcHhLlMmQqSsTtVvZz":
            continue
        if finite_number(token) is None:
            issues.error(f"{label} 的路径包含非有限数值：{token!r}。")
            return

    index = 0
    while index < len(tokens):
        command = tokens[index]
        if command not in "AaCcHhLlMmQqSsTtVvZz":
            issues.error(f"{label} 的路径在 {command!r} 前缺少命令。")
            return
        index += 1
        normalized = command.lower()
        if normalized == "z":
            continue

        start = index
        while index < len(tokens) and tokens[index] not in "AaCcHhLlMmQqSsTtVvZz":
            index += 1
        count = index - start
        required = PATH_PARAMETER_COUNTS[normalized]
        if count < required or count % required != 0:
            issues.error(
                f"{label} 的路径命令 {command!r} 需要 {required} 的倍数个参数，实际为 {count}。"
            )
            return

        if normalized == "a":
            arc_tokens = tokens[start:index]
            for offset in range(0, len(arc_tokens), required):
                if float(arc_tokens[offset]) < 0 or float(arc_tokens[offset + 1]) < 0:
                    issues.error(f"{label} 的圆弧半径不得为负数。")
                    return
                if arc_tokens[offset + 3] not in {"0", "1"} or arc_tokens[offset + 4] not in {
                    "0",
                    "1",
                }:
                    issues.error(f"{label} 的圆弧命令标志位必须为 0 或 1。")
                    return


def tokenize_numeric_sequence(
    value: str,
    token_pattern: re.Pattern[str],
) -> tuple[list[re.Match[str]], str | None]:
    """Tokenize comma-wsp separated values and reject empty separators."""
    matches: list[re.Match[str]] = []
    position = 0
    previous_was_value = False

    while position < len(value):
        position = skip_path_whitespace(value, position)
        if position >= len(value):
            break

        if value[position] == ",":
            if not previous_was_value:
                return matches, value[position : position + 1]
            position = skip_path_whitespace(value, position + 1)
            if position >= len(value) or value[position] == ",":
                return matches, ","
            previous_was_value = False

        match = token_pattern.match(value, position)
        if match is None:
            return matches, value[position : position + 12]
        matches.append(match)
        position = match.end()
        previous_was_value = True

    return matches, None


def validate_points(element: etree._Element, points: str, issues: Issues) -> None:
    label = element_label(element)
    matches, invalid_fragment = tokenize_numeric_sequence(points, NUMBER_TOKEN_RE)
    if invalid_fragment is not None:
        issues.error(f"{label} 的 points 含非法数据：{invalid_fragment!r}。")
        return
    tokens = [match.group(0) for match in matches]
    for token in tokens:
        if finite_number(token) is None:
            issues.error(f"{label} 的 points 包含非有限数值：{token!r}。")
            return
    minimum = 6 if local_name(element.tag) == "polygon" else 4
    if len(tokens) < minimum or len(tokens) % 2 != 0:
        issues.error(f"{label} 的 points 必须包含完整坐标对：{points!r}。")


def tokenize_transform_values(value: str) -> tuple[list[tuple[float, str]], str | None]:
    tokens: list[tuple[float, str]] = []
    matches, invalid_fragment = tokenize_numeric_sequence(value, TRANSFORM_VALUE_RE)
    if invalid_fragment is not None:
        return tokens, invalid_fragment
    for match in matches:
        number = finite_number(match.group(1))
        if number is None:
            return tokens, match.group(0)
        tokens.append((number, (match.group(2) or "").lower()))
    return tokens, None


def valid_transform_units(name: str, values: list[tuple[float, str]]) -> bool:
    units = [unit for _, unit in values]
    if name in {"matrix", "scale"}:
        return all(not unit for unit in units)
    if name == "translate":
        length_units = {"", "%", "px", "pt", "pc", "mm", "cm", "in", "em", "ex"}
        return all(unit in length_units for unit in units)
    if name == "rotate" and len(values) == 3:
        return all(not unit for unit in units)
    return all(unit in {"", "deg", "grad", "rad", "turn"} for unit in units)


def validate_transform(element: etree._Element, transform: str, issues: Issues) -> None:
    label = element_label(element)
    if transform.strip().lower() == "none":
        return
    if not transform.strip():
        issues.error(f"{label} 的 transform 为空。")
        return

    cursor = 0
    function_count = 0
    for match in TRANSFORM_FUNCTION_RE.finditer(transform):
        gap = transform[cursor : match.start()]
        if function_count == 0:
            separator_is_valid = not gap.strip()
        else:
            separator_is_valid = (
                bool(gap)
                and not gap.strip(" \t\r\n,")
                and gap.count(",") <= 1
            )
        if not separator_is_valid:
            issues.error(f"{label} 的 transform 含非法片段：{gap!r}。")
            return

        name = match.group(1)
        if name not in TRANSFORM_ARGUMENT_COUNTS:
            issues.error(f"{label} 使用不受支持的 transform 函数 {name!r}。")
            return
        values, invalid_fragment = tokenize_transform_values(match.group(2))
        if invalid_fragment is not None:
            issues.error(
                f"{label} 的 transform 函数 {name!r} 含非法或非有限参数："
                f"{invalid_fragment!r}。"
            )
            return
        if len(values) not in TRANSFORM_ARGUMENT_COUNTS[name]:
            issues.error(
                f"{label} 的 transform 函数 {name!r} 参数数量无效：{len(values)}。"
            )
            return
        if not valid_transform_units(name, values):
            issues.error(f"{label} 的 transform 函数 {name!r} 使用了无效单位。")
            return

        function_count += 1
        cursor = match.end()

    tail = transform[cursor:]
    if function_count == 0 or tail.strip():
        fragment = tail if tail.strip() else transform
        issues.error(f"{label} 的 transform 含非法片段：{fragment!r}。")


def extract_url_targets(value: str) -> tuple[list[str], bool]:
    targets: list[str] = []
    matches = list(CSS_URL_RE.finditer(value))
    for match in matches:
        target = next(group for group in match.groups() if group is not None)
        targets.append(target.strip())
    malformed = value.lower().count("url(") != len(matches)
    return targets, malformed


def validate_avif_container(payload: bytes) -> str | None:
    """Check that top-level ISO BMFF boxes partition an AVIF payload exactly."""
    position = 0
    saw_ftyp = False
    while position < len(payload):
        remaining = len(payload) - position
        if remaining < 8:
            return "AVIF 末尾含不完整的 ISO BMFF box header"

        box_size = int.from_bytes(payload[position : position + 4], "big")
        box_type = payload[position + 4 : position + 8]
        header_size = 8
        if box_size == 1:
            if remaining < 16:
                return "AVIF 末尾含不完整的 extended-size box header"
            box_size = int.from_bytes(payload[position + 8 : position + 16], "big")
            header_size = 16
        elif box_size == 0:
            box_size = remaining

        if box_size < header_size:
            return f"AVIF box {box_type!r} 的声明尺寸无效"
        if box_size > remaining:
            return f"AVIF box {box_type!r} 在文件结束前被截断"
        if box_type == b"ftyp":
            saw_ftyp = True
        position += box_size

    if not saw_ftyp:
        return "AVIF 缺少 ftyp box"
    return None


def validate_image_container(payload: bytes, media_type: str) -> str | None:
    """Validate exact container termination beyond decoder best-effort behavior."""
    if media_type == "image/gif":
        if not payload.startswith((b"GIF87a", b"GIF89a")):
            return "GIF signature 无效"
        if not payload.endswith(b"\x3b"):
            return "GIF 缺少文件末尾 trailer 0x3B"
        return None

    if media_type == "image/png":
        signature = b"\x89PNG\r\n\x1a\n"
        iend = b"\x00\x00\x00\x00IEND\xaeB\x60\x82"
        if not payload.startswith(signature):
            return "PNG signature 无效"
        if not payload.endswith(iend):
            return "PNG 缺少完整的末尾 IEND chunk"
        return None

    if media_type == "image/jpeg":
        if not payload.startswith(b"\xff\xd8"):
            return "JPEG SOI marker 无效"
        if not payload.endswith(b"\xff\xd9"):
            return "JPEG 缺少文件末尾 EOI marker"
        return None

    if media_type == "image/webp":
        if len(payload) < 12 or payload[:4] != b"RIFF" or payload[8:12] != b"WEBP":
            return "WebP RIFF header 无效"
        declared_size = int.from_bytes(payload[4:8], "little") + 8
        if declared_size != len(payload):
            return (
                f"WebP RIFF 声明长度为 {declared_size} 字节，"
                f"实际为 {len(payload)} 字节"
            )
        return None

    if media_type == "image/avif":
        return validate_avif_container(payload)
    return "嵌入图像类型不在容器校验范围内"


def validate_data_uri(target: str, context: str, issues: Issues) -> None:
    header, separator, payload = target.partition(",")
    if not separator:
        issues.error(f"{context} 包含格式不完整的 data URI。")
        return

    metadata = header[5:].split(";")
    media_type = metadata[0].strip().lower()
    if media_type not in SAFE_DATA_IMAGE_TYPES:
        issues.error(
            f"{context} 使用不受支持的嵌入资源类型 {media_type or '(omitted)'!r}；"
            "仅允许已批准的栅格图像类型。"
        )
        return

    try:
        encoded_payload = unquote_to_bytes(payload)
        if any(part.strip().lower() == "base64" for part in metadata[1:]):
            compact_payload = re.sub(rb"\s+", b"", encoded_payload)
            decoded_payload = base64.b64decode(compact_payload, validate=True)
        else:
            decoded_payload = encoded_payload
    except (ValueError, binascii.Error) as exc:
        issues.error(f"{context} 的 data URI 编码无效：{concise_exception(exc)}")
        return

    if len(decoded_payload) > MAX_EMBEDDED_RESOURCE_BYTES:
        issues.error(
            f"{context} 的嵌入资源为 {len(decoded_payload)} 字节，"
            f"超过 {MAX_EMBEDDED_RESOURCE_BYTES} 字节上限。"
        )
        return

    try:
        image_module = import_module("PIL.Image")
    except Exception as exc:
        issues.error(
            f"{context} 的嵌入图像无法检查；Pillow 不可用：{concise_exception(exc)}"
        )
        return

    try:
        with image_module.open(BytesIO(decoded_payload)) as image:
            detected_type = PILLOW_FORMAT_MEDIA_TYPES.get((image.format or "").upper())
            if detected_type != media_type:
                issues.error(
                    f"{context} 的 data URI 声明为 {media_type!r}，"
                    f"实际图像类型为 {detected_type or image.format or 'unknown'!r}。"
                )
                return
            container_error = validate_image_container(decoded_payload, media_type)
            if container_error is not None:
                issues.error(
                    f"{context} 的嵌入图像容器不完整或无效：{container_error}。"
                )
                return
            frame_count = getattr(image, "n_frames", 1)
            if frame_count != 1 or getattr(image, "is_animated", False):
                issues.error(
                    f"{context} 的嵌入图像包含 {frame_count} 帧；"
                    "默认交付契约只允许静态单帧图像。"
                )
                return
            if image.width <= 0 or image.height <= 0:
                issues.error(f"{context} 的嵌入图像尺寸无效。")
                return
            if image.width * image.height > MAX_RENDER_PIXELS:
                issues.error(
                    f"{context} 的嵌入图像尺寸为 {image.width}×{image.height}，"
                    f"超过 {MAX_RENDER_PIXELS} 像素上限。"
                )
                return
            image.verify()
        with image_module.open(BytesIO(decoded_payload)) as image:
            image.load()
    except Exception as exc:
        issues.error(f"{context} 的嵌入图像无法解码或校验：{concise_exception(exc)}")


def validate_reference_target(
    target: str,
    context: str,
    ids: dict[str, etree._Element],
    issues: Issues,
    expected_types: set[str] | None = None,
) -> None:
    stripped_target = target.strip()
    if not stripped_target:
        issues.error(f"{context} 包含空资源引用。")
        return
    if stripped_target.lower().startswith("data:"):
        validate_data_uri(stripped_target, context, issues)
        return

    normalized = unquote(stripped_target)
    if normalized.startswith("#"):
        reference_id = normalized[1:]
        referenced_element = ids.get(reference_id)
        if not reference_id or referenced_element is None:
            issues.error(f"{context} 引用了不存在的 id {normalized!r}。")
        elif expected_types and local_name(referenced_element.tag) not in expected_types:
            expected = ", ".join(sorted(expected_types))
            actual = local_name(referenced_element.tag)
            issues.error(
                f"{context} 将 {normalized!r} 引用为错误类型；"
                f"目标是 <{actual}>，预期为 {expected}。"
            )
        return
    issues.error(f"{context} 使用外部资源 {target!r}。")


def validate_url_functions(
    value: str,
    context: str,
    ids: dict[str, etree._Element],
    issues: Issues,
    expected_types: set[str] | None = None,
) -> None:
    targets, malformed = extract_url_targets(value)
    if malformed:
        issues.error(f"{context} 包含格式不完整的 url(...)。")
    for target in targets:
        validate_reference_target(target, context, ids, issues, expected_types)


def validate_css(
    css: str,
    context: str,
    ids: dict[str, etree._Element],
    issues: Issues,
) -> None:
    comment_free = strip_css_comments(css)
    keyword_surface = decode_css_escapes(
        mask_css_strings(comment_free, preserve_url_arguments=False)
    )
    resource_surface = decode_css_escapes(
        mask_css_strings(comment_free, preserve_url_arguments=True)
    )
    image_set_targets, malformed_image_set, indirect_image_set = (
        extract_css_image_set_targets(comment_free)
    )
    if malformed_image_set:
        issues.error(f"{context} 包含格式不完整的 CSS 字符串或图像函数。")
    if indirect_image_set:
        issues.error(
            f"{context} 的 CSS 图像函数通过 var()/attr()/env() 间接确定资源；"
            "无法证明其为独立资源。"
        )
    for target in image_set_targets:
        validate_reference_target(target, f"{context} 的 CSS 图像函数资源", ids, issues)
    if BAD_VALUE_TOKEN_RE.search(keyword_surface):
        issues.error(f"{context} 含非有限或未定义值。")
    if CSS_IMPORT_RE.search(keyword_surface):
        issues.error(f"{context} 使用 @import 外部样式表。")
    if CSS_FONT_FACE_RE.search(keyword_surface):
        issues.error(f"{context} 使用 @font-face；独立 SVG 不得依赖外部或本地安装字体。")
    if "url(" in resource_surface.lower():
        validate_url_functions(resource_surface, context, ids, issues)

    for declaration in CSS_DECLARATION_RE.finditer(resource_surface):
        property_name = declaration.group("property").lower()
        property_value = declaration.group("value")
        if property_name in CSS_FINITE_NUMBER_PROPERTIES:
            numeric_value = CSS_URL_RE.sub(" ", property_value)
            for number_match in NUMBER_TOKEN_RE.finditer(numeric_value):
                start, end = number_match.span()
                preceding = numeric_value[start - 1] if start else ""
                following = numeric_value[end] if end < len(numeric_value) else ""
                if preceding and (preceding.isalnum() or preceding in "._#-"):
                    continue
                if following == ".":
                    continue
                if finite_number(number_match.group(0)) is None:
                    issues.error(
                        f"{context} 的 CSS 属性 {property_name!r} 包含非有限数值："
                        f"{number_match.group(0)!r}。"
                    )
                    break

        expected_types = REFERENCE_TARGET_TYPES.get(property_name)
        if not expected_types or "url(" not in property_value.lower():
            continue
        targets, _ = extract_url_targets(property_value)
        property_context = f"{context} 的 CSS 属性 {property_name!r}"
        for target in targets:
            normalized_target = unquote(target.strip())
            if not normalized_target.startswith("#"):
                continue
            reference_id = normalized_target[1:]
            if reference_id and reference_id in ids:
                validate_reference_target(
                    target,
                    property_context,
                    ids,
                    issues,
                    expected_types,
                )


def validate_references(
    root: etree._Element,
    ids: dict[str, etree._Element],
    issues: Issues,
) -> None:
    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        element_name = local_name(element.tag)
        element_namespace = etree.QName(element.tag).namespace
        if inside_svg_metadata(element) and not (
            element_namespace == SVG_NS and element_name == "style"
        ):
            continue
        label = element_label(element)

        for raw_name, value in element.attrib.items():
            name = etree.QName(raw_name).localname if raw_name.startswith("{") else raw_name
            context = f"{label} 的属性 {name!r}"
            if name == "href":
                validate_reference_target(
                    value,
                    context,
                    ids,
                    issues,
                    HREF_TARGET_TYPES.get(element_name),
                )
            elif name == "style":
                validate_css(value, context, ids, issues)
            elif name in URL_FUNCTION_ATTRS:
                reference_value = decode_css_escapes(strip_css_comments(value))
                if "url(" not in reference_value.lower():
                    continue
                validate_url_functions(
                    reference_value,
                    context,
                    ids,
                    issues,
                    REFERENCE_TARGET_TYPES.get(name),
                )

        if element_name == "style":
            validate_css("".join(element.itertext()), f"{label} 的 CSS", ids, issues)

        for aria_attribute in ARIA_IDREF_ATTRS:
            raw_ids = element.get(aria_attribute)
            if not raw_ids:
                continue
            for reference_id in raw_ids.split():
                if reference_id not in ids:
                    issues.error(
                        f"{label} 的 {aria_attribute} 引用了不存在的 id '#{reference_id}'。"
                    )


def validate(path: Path) -> ValidationReport:
    issues = Issues()

    try:
        raw_bytes = path.read_bytes()
    except OSError as exc:
        issues.error(f"无法读取文件：{exc}")
        return issues.report(None)

    try:
        raw_text = raw_bytes.decode("utf-8-sig")
    except UnicodeDecodeError as exc:
        issues.error(f"文件不是有效 UTF-8：{exc}")
        return issues.report(None)

    stripped_lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    if stripped_lines and (
        MARKDOWN_FENCE_RE.fullmatch(stripped_lines[0])
        or MARKDOWN_FENCE_RE.fullmatch(stripped_lines[-1])
    ):
        issues.error("文件包含包裹 SVG 的 Markdown 代码围栏。")

    entity_errors_before_parse = len(issues.errors)
    entity_scan_text = mask_xml_literals(raw_text)
    for match in NAMED_ENTITY_RE.finditer(entity_scan_text):
        entity = match.group(1)
        if entity not in ALLOWED_NAMED_ENTITIES:
            line = raw_text.count("\n", 0, match.start()) + 1
            issues.error(
                f"第 {line} 行使用未定义的 XML 命名实体 '&{entity};'；"
                "请改用 UTF-8 字符、数字字符引用或显式坐标。"
            )
    has_entity_errors = len(issues.errors) > entity_errors_before_parse

    if XML_STYLESHEET_RE.search(entity_scan_text):
        issues.error("禁止使用 xml-stylesheet 处理指令加载外部样式。")

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
        if not has_entity_errors or "Entity" not in str(exc):
            issues.error(f"XML 解析失败：{exc}")
        return issues.report(None)

    if root.getroottree().docinfo.doctype:
        issues.error("禁止使用 DOCTYPE；独立 SVG 不应声明或加载 XML 实体。")

    if local_name(root.tag) != "svg":
        issues.error("根元素不是 <svg>。")
    elif etree.QName(root.tag).namespace != SVG_NS:
        issues.error(f"SVG 根元素缺少正确命名空间 xmlns=\"{SVG_NS}\"。")

    viewbox = parse_viewbox(root.get("viewBox"))
    if viewbox is None:
        issues.error("缺少合法 viewBox；格式应为 'minX minY width height'，宽高必须大于 0。")
    validate_root_length(root, "width", viewbox[2] if viewbox else None, issues)
    validate_root_length(root, "height", viewbox[3] if viewbox else None, issues)

    ids: dict[str, etree._Element] = {}
    duplicate_ids: set[str] = set()

    for element in root.iter():
        if not isinstance(element.tag, str):
            continue
        name = local_name(element.tag)
        namespace = etree.QName(element.tag).namespace
        label = element_label(element)

        if namespace != SVG_NS and not inside_svg_metadata(element):
            issues.error(f"{label} 不在 SVG 命名空间中。")
        if name.lower() in FORBIDDEN_ELEMENTS:
            issues.error(f"禁止元素 {label}；独立 SVG 不应执行脚本或嵌入 HTML。")
        if namespace == SVG_NS and name.lower() in SMIL_ELEMENTS:
            issues.error(f"禁止动画元素 {label}；默认交付契约是静态独立 SVG。")

        element_id = element.get("id")
        if element_id:
            if element_id in ids:
                duplicate_ids.add(element_id)
            else:
                ids[element_id] = element

        for raw_name, value in element.attrib.items():
            attribute_name = etree.QName(raw_name) if raw_name.startswith("{") else None
            attribute = attribute_name.localname if attribute_name is not None else raw_name
            if (
                attribute_name is not None
                and attribute_name.namespace == XML_NS
                and attribute == "base"
            ):
                issues.error(
                    f"{label} 使用 xml:base；它会改变局部引用的所有权和解析位置。"
                )
            if re.fullmatch(r"on[a-zA-Z].*", attribute):
                issues.error(f"{label} 使用事件处理属性 {attribute!r}。")

            if attribute in NUMERIC_ATTRS:
                validate_numeric_attribute(element, attribute, value, issues)
            if attribute == "d":
                validate_path_data(element, value, issues)
            if attribute == "points" and name in {"polygon", "polyline"}:
                validate_points(element, value, issues)
            if attribute in TRANSFORM_ATTRS:
                validate_transform(element, value, issues)
            if attribute == "viewBox" and element is not root and parse_viewbox(value) is None:
                issues.error(
                    f"{label} 的 viewBox 无效；必须包含四个有限数值且宽高大于 0。"
                )
            numeric_context = attribute in (
                NUMERIC_ATTRS | STRUCTURED_NUMERIC_ATTRS | TRANSFORM_ATTRS
            )
            numeric_value = strip_css_comments(value) if attribute == "style" else value
            if numeric_context and BAD_VALUE_TOKEN_RE.search(numeric_value):
                issues.error(f"{label} 的属性 {attribute!r} 含非有限或未定义值：{value!r}。")

    if duplicate_ids:
        issues.error("存在重复 id：" + ", ".join(sorted(duplicate_ids)))

    validate_references(root, ids, issues)

    for element, text in text_segments(root):
        if "\t" in text:
            issues.warning(f"{element_label(element)} 的可见文本含制表符；请使用坐标对齐。")
        if "  " in text and not preserves_space(element):
            issues.warning(
                f"{element_label(element)} 的可见文本含连续空格；SVG/XML 可能折叠空白，请使用 x/dx 对齐。"
            )
        if any(character in text for character in SPECIAL_SPACING_CHARACTERS):
            issues.warning(
                f"{element_label(element)} 的可见文本含特殊空白字符；"
                "不要用不换行、en 或 em 空格进行布局。"
            )

    decorative = root.get("aria-hidden", "").lower() == "true"
    title_count = sum(1 for element in root if local_name(element.tag) == "title")
    if not decorative and title_count == 0:
        issues.warning("信息性 SVG 建议添加 <title>，用于可访问性和文件说明。")
    if decorative and any(root.get(attribute) for attribute in ARIA_IDREF_ATTRS):
        issues.warning("根元素同时使用 aria-hidden='true' 和 ARIA 文本引用；请明确可访问性意图。")

    return issues.report(root)


def concise_exception(exc: BaseException, limit: int = 320) -> str:
    detail = " ".join(str(exc).split()) or exc.__class__.__name__
    return detail if len(detail) <= limit else detail[: limit - 1] + "…"


def find_browser() -> str | None:
    command_names = (
        "chromium",
        "chromium-browser",
        "google-chrome",
        "google-chrome-stable",
        "chrome",
        "msedge",
        "microsoft-edge",
    )
    for name in command_names:
        executable = shutil.which(name)
        if executable:
            return executable

    candidates: list[Path] = []
    if sys.platform == "win32":
        for environment_name in ("PROGRAMFILES", "PROGRAMFILES(X86)", "LOCALAPPDATA"):
            base = os.environ.get(environment_name)
            if not base:
                continue
            candidates.extend(
                [
                    Path(base) / "Google/Chrome/Application/chrome.exe",
                    Path(base) / "Microsoft/Edge/Application/msedge.exe",
                ]
            )
    elif sys.platform == "darwin":
        candidates.extend(
            [
                Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
                Path("/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
                Path("/Applications/Chromium.app/Contents/MacOS/Chromium"),
            ]
        )

    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return None


def probe_renderer(name: str) -> tuple[RendererSpec | None, str | None]:
    if name == "inkscape":
        executable = shutil.which("inkscape")
        if executable:
            return RendererSpec(name, executable=executable), None
        return None, "未找到 Inkscape 可执行文件"

    if name == "cairosvg":
        try:
            module = import_module("cairosvg")
        except Exception as exc:
            return None, f"CairoSVG 或其本地依赖不可用：{concise_exception(exc)}"
        return RendererSpec(name, module=module), None

    if name == "browser":
        executable = find_browser()
        if executable:
            return RendererSpec(name, executable=executable), None
        return None, "未找到 Chromium、Chrome 或 Edge"

    return None, f"未知渲染器 {name!r}"


def select_renderer(requested: str) -> tuple[RendererSpec | None, str | None]:
    if requested != "auto":
        spec, reason = probe_renderer(requested)
        if spec is None:
            return None, f"渲染器 {requested!r} 不可用：{reason}。"
        return spec, None

    reasons: list[str] = []
    for name in ("inkscape", "cairosvg", "browser"):
        spec, reason = probe_renderer(name)
        if spec is not None:
            return spec, None
        reasons.append(f"{name}: {reason}")
    return None, "没有可用的 SVG 渲染器（" + "; ".join(reasons) + "）。"


def render_dimensions(root: etree._Element) -> tuple[int, int] | None:
    viewbox = parse_viewbox(root.get("viewBox"))
    if viewbox is None:
        return None

    dimensions: list[int] = []
    for attribute, fallback in (("width", viewbox[2]), ("height", viewbox[3])):
        parsed = parse_length(root.get(attribute))
        if parsed is None or parsed[0] <= 0 or parsed[1] == "%":
            pixels = fallback
        else:
            number, unit = parsed
            pixels = number * PIXELS_PER_UNIT.get(unit, 1.0)
        dimensions.append(max(1, math.ceil(pixels)))
    return dimensions[0], dimensions[1]


def render_size_error(dimensions: tuple[int, int]) -> str | None:
    width, height = dimensions
    if width > MAX_RENDER_DIMENSION or height > MAX_RENDER_DIMENSION:
        return (
            f"渲染尺寸过大：{width}×{height}；单边不得超过 "
            f"{MAX_RENDER_DIMENSION} 像素。"
        )
    if width * height > MAX_RENDER_PIXELS:
        return (
            f"渲染尺寸过大：{width}×{height} 共 {width * height} 像素；"
            f"不得超过 {MAX_RENDER_PIXELS} 像素。"
        )
    return None


def render_with_inkscape(spec: RendererSpec, svg_path: Path, png_path: Path) -> str | None:
    command = [
        spec.executable or "inkscape",
        str(svg_path),
        "--export-type=png",
        f"--export-filename={png_path}",
    ]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=120)
    except (OSError, subprocess.SubprocessError) as exc:
        return f"Inkscape 渲染失败：{concise_exception(exc)}"
    if result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        return f"Inkscape 渲染失败：{detail or f'退出码 {result.returncode}'}"
    return None


def render_with_cairosvg(spec: RendererSpec, svg_path: Path, png_path: Path) -> str | None:
    try:
        spec.module.svg2png(url=str(svg_path), write_to=str(png_path))  # type: ignore[attr-defined]
    except Exception as exc:
        return f"CairoSVG 渲染失败：{concise_exception(exc)}"
    return None


def render_with_browser(
    spec: RendererSpec,
    svg_path: Path,
    png_path: Path,
    dimensions: tuple[int, int],
) -> str | None:
    width, height = dimensions

    with tempfile.TemporaryDirectory(
        prefix="svg-preflight-browser-", ignore_cleanup_errors=True
    ) as profile_directory:
        command = [
            spec.executable or "chromium",
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--no-default-browser-check",
            "--no-first-run",
            "--force-device-scale-factor=1",
            "--default-background-color=00000000",
            f"--user-data-dir={profile_directory}",
            f"--screenshot={png_path}",
            f"--window-size={width},{height}",
            svg_path.resolve().as_uri(),
        ]
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=120)
        except (OSError, subprocess.SubprocessError) as exc:
            return f"浏览器渲染失败：{concise_exception(exc)}"
        if result.returncode != 0:
            detail = (result.stderr or result.stdout).strip()
            return f"浏览器渲染失败：{detail or f'退出码 {result.returncode}'}"

        for _ in range(20):
            if png_path.is_file() and png_path.stat().st_size > 0:
                break
            time.sleep(0.1)

    return None


def inspect_png(png_path: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    if not png_path.is_file() or png_path.stat().st_size <= 0:
        return ["渲染器未生成非空 PNG。"], warnings

    try:
        image_module = import_module("PIL.Image")
    except Exception as exc:
        warnings.append(f"Pillow 不可用，跳过 PNG 边界检查：{concise_exception(exc)}")
        return errors, warnings

    try:
        with image_module.open(png_path) as image:
            if image.width <= 0 or image.height <= 0:
                errors.append("渲染出的 PNG 尺寸无效。")
                return errors, warnings
            rgba = image.convert("RGBA")
            if rgba.getextrema() == ((255, 255), (255, 255), (255, 255), (255, 255)):
                warnings.append("渲染结果为全白画布，可能未加载 SVG 内容。")
                return errors, warnings
            alpha = rgba.getchannel("A")
            bounds = alpha.getbbox()
            if bounds is None:
                warnings.append("渲染结果完全透明，可能没有可见内容。")
                return errors, warnings

            left, top, right, bottom = bounds
            corners = [
                alpha.getpixel((0, 0)),
                alpha.getpixel((image.width - 1, 0)),
                alpha.getpixel((0, image.height - 1)),
                alpha.getpixel((image.width - 1, image.height - 1)),
            ]
            full_canvas_background = (
                left == 0
                and top == 0
                and right == image.width
                and bottom == image.height
                and all(value > 0 for value in corners)
            )
            if not full_canvas_background and (
                left <= 1 or top <= 1 or right >= image.width - 1 or bottom >= image.height - 1
            ):
                warnings.append("可见内容接近或接触画布边缘，可能存在裁切风险。")
    except Exception as exc:
        warnings.append(f"PNG 边界检查失败：{concise_exception(exc)}")
    return errors, warnings


def paths_refer_to_same_file(first: Path, second: Path) -> bool:
    try:
        if first.resolve() == second.resolve():
            return True
    except OSError:
        pass
    try:
        return first.exists() and second.exists() and os.path.samefile(first, second)
    except OSError:
        return False


def render_svg(
    svg_path: Path,
    png_path: Path,
    renderer: str = "auto",
    root: etree._Element | None = None,
) -> RenderReport:
    if paths_refer_to_same_file(svg_path, png_path):
        return RenderReport(("PNG 输出路径不得与输入 SVG 指向同一文件。",), (), None)

    if root is None:
        root = validate(svg_path).root
    if root is None:
        return RenderReport(("无法解析 SVG，因此不能安全渲染。",), (), None)
    dimensions = render_dimensions(root)
    if dimensions is None:
        return RenderReport(("渲染需要合法 viewBox。",), (), None)
    size_error = render_size_error(dimensions)
    if size_error is not None:
        return RenderReport((size_error,), (), None)

    spec, selection_error = select_renderer(renderer)
    if spec is None:
        return RenderReport((selection_error or "无法选择 SVG 渲染器。",), (), None)

    try:
        png_path.parent.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        return RenderReport((f"无法创建 PNG 输出目录：{exc}",), (), spec.name)

    try:
        with tempfile.TemporaryDirectory(
            prefix=f".{png_path.stem}-",
            dir=png_path.parent,
            ignore_cleanup_errors=True,
        ) as temporary_directory:
            temporary_path = Path(temporary_directory) / "preview.png"
            if spec.name == "inkscape":
                render_error = render_with_inkscape(spec, svg_path, temporary_path)
            elif spec.name == "cairosvg":
                render_error = render_with_cairosvg(spec, svg_path, temporary_path)
            else:
                render_error = render_with_browser(spec, svg_path, temporary_path, dimensions)

            if render_error:
                return RenderReport((render_error,), (), spec.name)

            errors, warnings = inspect_png(temporary_path)
            if errors:
                return RenderReport(tuple(errors), tuple(warnings), spec.name)

            try:
                temporary_path.replace(png_path)
            except OSError as exc:
                return RenderReport(
                    (f"无法写入 PNG 输出文件：{exc}",),
                    tuple(warnings),
                    spec.name,
                )
            return RenderReport((), tuple(warnings), spec.name)
    except OSError as exc:
        return RenderReport((f"无法创建临时 PNG 输出：{exc}",), (), spec.name)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate a standalone SVG and optionally render a PNG preview."
    )
    parser.add_argument("svg", type=Path, help="SVG file to validate")
    parser.add_argument("--render", type=Path, help="render the SVG to this PNG path")
    parser.add_argument(
        "--renderer",
        choices=("auto", "inkscape", "cairosvg", "browser"),
        default="auto",
        help="PNG renderer; auto tries Inkscape, CairoSVG, then a Chromium-family browser",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="treat warnings as failures; recommended before final delivery",
    )
    args = parser.parse_args()

    validation = validate(args.svg)
    errors = list(validation.errors)
    warnings = list(validation.warnings)
    renderer_used: str | None = None

    if args.render and not errors:
        render = render_svg(args.svg, args.render, args.renderer, validation.root)
        errors.extend(render.errors)
        warnings.extend(render.warnings)
        renderer_used = render.renderer

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

    render_note = ""
    if args.render:
        render_note = f", rendered to {args.render} with {renderer_used}"
    print(f"PASS: valid standalone SVG{render_note}; {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
