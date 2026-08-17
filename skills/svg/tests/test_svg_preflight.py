from __future__ import annotations

import base64
import importlib.util
from io import BytesIO
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock


SKILL_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = SKILL_ROOT / "scripts" / "svg_preflight.py"
MODULE_NAME = "svg_preflight_under_test"

SPEC = importlib.util.spec_from_file_location(MODULE_NAME, SCRIPT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load {SCRIPT_PATH}")
SVG_PREFLIGHT = importlib.util.module_from_spec(SPEC)
sys.modules[MODULE_NAME] = SVG_PREFLIGHT
SPEC.loader.exec_module(SVG_PREFLIGHT)


class SvgPreflightTests(unittest.TestCase):
    def validate_text(self, text: str):
        with tempfile.TemporaryDirectory(prefix="svg-preflight-test-") as directory:
            path = Path(directory) / "fixture.svg"
            path.write_text(text, encoding="utf-8")
            return SVG_PREFLIGHT.validate(path)

    def standalone_svg(self, body: str, root_attributes: str = "") -> str:
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 100 100" width="100" height="100" {root_attributes}>
  <title id="title">Probe</title>
  {body}
</svg>
"""

    def image_data_uri(self, format_name: str, media_type: str, frames: int = 1) -> str:
        from PIL import Image

        images = [Image.new("RGBA", (2, 2), (index * 120, 0, 255, 255)) for index in range(frames)]
        output = BytesIO()
        save_options = {}
        if frames > 1:
            save_options = {
                "save_all": True,
                "append_images": images[1:],
                "duration": 100,
                "loop": 0,
            }
        images[0].save(output, format=format_name, **save_options)
        payload = base64.b64encode(output.getvalue()).decode("ascii")
        return f"data:{media_type};base64,{payload}"

    def assert_error_contains(self, report, fragment: str) -> None:
        self.assertTrue(
            any(fragment in error for error in report.errors),
            f"Expected error containing {fragment!r}, got {report.errors!r}",
        )

    def test_good_example_passes_strict_validation(self) -> None:
        report = SVG_PREFLIGHT.validate(SKILL_ROOT / "examples" / "good-diagram.svg")
        self.assertEqual((), report.errors)
        self.assertEqual((), report.warnings)

    def test_bad_named_entity_is_reported_without_parser_noise(self) -> None:
        report = SVG_PREFLIGHT.validate(SKILL_ROOT / "examples" / "bad-entity.svg")
        self.assertEqual(1, len(report.errors))
        self.assert_error_contains(report, "&ensp;")

    def test_named_entity_text_inside_cdata_and_comments_is_not_misclassified(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                "<!-- &ensp; is literal comment text -->"
                "<text x=\"10\" y=\"50\"><![CDATA[&ensp;]]></text>"
            )
        )
        self.assertEqual((), report.errors)

    def test_relative_href_is_an_external_dependency(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<image href="asset.png" x="0" y="0" width="10" height="10"/>')
        )
        self.assert_error_contains(report, "外部资源")

    def test_xml_base_cannot_rebind_local_fragment_references(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><rect id="shape" width="10" height="10"/></defs>'
                '<g xml:base="https://example.invalid/external.svg">'
                '<use href="#shape"/>'
                '</g>'
            )
        )
        self.assert_error_contains(report, "xml:base")

    def test_external_paint_server_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect x="0" y="0" width="10" height="10" '
                'fill="url(https://example.com/paint.svg#gradient)"/>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_css_escaped_external_resource_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                r'<style>.shape { fill: u\72l(https://example.invalid/p.svg); }</style>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_metadata_style_external_resource_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<metadata><style>.shape { fill: url(https://example.invalid/p.svg); }'
                '</style></metadata>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_external_stylesheet_import_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>@import url("theme.css");</style>'
                '<rect x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "@import")

    def test_css_examples_inside_comments_are_not_treated_as_dependencies(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>/* @import url("theme.css"); */ .shape { fill: #fff; }</style>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assertEqual((), report.errors)

    def test_css_keywords_inside_an_ordinary_string_are_not_dependencies(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>.shape { --literal: "@font-face '
                'url(https://example.invalid/font.woff2)"; fill: #fff; }</style>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assertEqual((), report.errors)

    def test_image_set_string_url_is_an_external_dependency(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>svg { background-image: '
                'image-set("https://example.invalid/p.png" 1x); }</style>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_image_set_data_uri_uses_the_same_size_limit(self) -> None:
        with mock.patch.object(SVG_PREFLIGHT, "MAX_EMBEDDED_RESOURCE_BYTES", 2):
            report = self.validate_text(
                self.standalone_svg(
                    '<style>svg { background-image: '
                    'image-set("data:image/png;base64,AAAA" 1x); }</style>'
                )
            )
        self.assert_error_contains(report, "上限")

    def test_image_set_cannot_hide_a_resource_behind_a_variable(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>.shape { --source: "https://example.invalid/p.png"; '
                'background-image: image-set(var(--source) 1x); }</style>'
            )
        )
        self.assert_error_contains(report, "间接确定资源")

    def test_escaped_image_set_name_still_checks_string_urls(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                r'<style>svg { background-image: ima\67 e-set('
                r'"https://example.invalid/p.png" 1x); }</style>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_css_image_function_string_url_is_an_external_dependency(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>svg { background-image: '
                'image("https://example.invalid/p.png", #fff); }</style>'
            )
        )
        self.assert_error_contains(report, "外部资源")

    def test_missing_css_fragment_reference_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>.shape { fill: url(#missing); }</style>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "#missing")
        self.assertEqual(1, sum("#missing" in error for error in report.errors))

    def test_reference_target_must_match_the_property_type(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><rect id="target" width="10" height="10"/></defs>'
                '<path d="M 0 0 H 10" fill="url(#target)" '
                'marker-end="url(#target)"/>'
            )
        )
        self.assert_error_contains(report, "错误类型")

    def test_marker_shorthand_reference_must_target_a_marker(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><rect id="target" width="10" height="10"/></defs>'
                '<path d="M 0 0 H 10" marker="url(#target)"/>'
            )
        )
        self.assert_error_contains(report, "错误类型")

    def test_css_reference_target_must_match_the_property_type(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><rect id="target" width="10" height="10"/></defs>'
                '<style>.shape { fill: url(#target); }</style>'
                '<rect class="shape" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "错误类型")

    def test_font_face_is_rejected_as_a_host_dependency(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>@font-face { font-family: Probe; src: local(Probe); }</style>'
                '<text x="10" y="50">Probe</text>'
            )
        )
        self.assert_error_contains(report, "@font-face")

    def test_embedded_data_uri_is_not_external(self) -> None:
        data_uri = self.image_data_uri("PNG", "image/png")
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{data_uri}" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assertEqual((), report.errors)

    def test_animated_gif_data_uri_is_rejected(self) -> None:
        data_uri = self.image_data_uri("GIF", "image/gif", frames=2)
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{data_uri}" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "帧")

    def test_truncated_single_frame_gif_data_uri_is_rejected(self) -> None:
        data_uri = self.image_data_uri("GIF", "image/gif")
        header, payload = data_uri.split(",", 1)
        image_bytes = base64.b64decode(payload)
        self.assertEqual(b"\x3b", image_bytes[-1:])
        truncated_payload = base64.b64encode(image_bytes[:-1]).decode("ascii")
        truncated_data_uri = f"{header},{truncated_payload}"
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{truncated_data_uri}" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "trailer")

    def test_data_uri_media_type_must_match_the_payload(self) -> None:
        data_uri = self.image_data_uri("GIF", "image/png")
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{data_uri}" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "实际图像类型")

    def test_animated_png_data_uri_is_rejected(self) -> None:
        data_uri = self.image_data_uri("PNG", "image/png", frames=2)
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{data_uri}" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "帧")

    def test_embedded_svg_data_uri_is_rejected(self) -> None:
        nested_svg = (
            "data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E"
            "%3Cimage%20href%3D%27https%3A%2F%2Fexample.invalid%2Fa.png%27%2F%3E"
            "%3C%2Fsvg%3E"
        )
        report = self.validate_text(
            self.standalone_svg(
                f'<image href="{nested_svg}" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "image/svg+xml")

    def test_root_dimensions_must_be_positive(self) -> None:
        text = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
     width="-10" height="0">
  <title>Invalid dimensions</title>
</svg>"""
        report = self.validate_text(text)
        self.assert_error_contains(report, "width 必须大于 0")
        self.assert_error_contains(report, "height 必须大于 0")

    def test_root_viewbox_values_must_be_finite(self) -> None:
        text = self.standalone_svg('<rect x="0" y="0" width="1" height="1"/>')
        text = text.replace('viewBox="0 0 100 100"', 'viewBox="0 0 1e999 100"')
        report = self.validate_text(text)
        self.assert_error_contains(report, "合法 viewBox")

    def test_root_viewbox_rejects_an_empty_separator(self) -> None:
        text = self.standalone_svg('<rect x="0" y="0" width="1" height="1"/>')
        text = text.replace('viewBox="0 0 100 100"', 'viewBox="0 0,,100 100"')
        report = self.validate_text(text)
        self.assert_error_contains(report, "合法 viewBox")

    def test_missing_root_dimensions_are_errors(self) -> None:
        text = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <title>Missing dimensions</title>
</svg>"""
        report = self.validate_text(text)
        self.assert_error_contains(report, "缺少 width")
        self.assert_error_contains(report, "缺少 height")

    def test_markdown_fences_are_rejected_as_artifact_content(self) -> None:
        report = self.validate_text(
            "```svg\n"
            + self.standalone_svg('<circle cx="50" cy="50" r="20"/>')
            + "```\n"
        )
        self.assert_error_contains(report, "Markdown")

    def test_doctype_is_rejected(self) -> None:
        text = """<?xml version="1.0"?>
<!DOCTYPE svg>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"
     width="10" height="10">
  <title>Doctype probe</title>
</svg>"""
        report = self.validate_text(text)
        self.assert_error_contains(report, "DOCTYPE")

    def test_xml_stylesheet_processing_instruction_is_rejected(self) -> None:
        text = """<?xml version="1.0"?>
<?xml-stylesheet href="theme.css" type="text/css"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"
     width="10" height="10">
  <title>Stylesheet probe</title>
</svg>"""
        report = self.validate_text(text)
        self.assert_error_contains(report, "xml-stylesheet")

    def test_duplicate_ids_are_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<circle id="dot" cx="20" cy="20" r="10"/>'
                '<circle id="dot" cx="80" cy="80" r="10"/>'
            )
        )
        self.assert_error_contains(report, "重复 id")

    def test_missing_presentation_attribute_reference_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<path d="M 10 50 H 90" marker-end="url(#missing-arrow)"/>'
            )
        )
        self.assert_error_contains(report, "#missing-arrow")

    def test_xml_space_preserve_prevents_false_whitespace_warning(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<text x="10" y="50" xml:space="preserve">A  B</text>')
        )
        self.assertEqual((), report.errors)
        self.assertFalse(any("连续空格" in warning for warning in report.warnings))

    def test_special_spacing_characters_are_warned(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<text x="10" y="50">A&#160;B</text>')
        )
        self.assertTrue(any("特殊空白" in warning for warning in report.warnings))

    def test_malformed_path_data_is_rejected(self) -> None:
        report = self.validate_text(self.standalone_svg('<path d="M 0 0 L x y"/>'))
        self.assert_error_contains(report, "非法片段")

    def test_non_finite_path_coordinate_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<path d="M 0 0 L 1e999 1"/>')
        )
        self.assert_error_contains(report, "非有限")

    def test_non_finite_points_coordinate_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<polyline points="0 0 1e999 1"/>')
        )
        self.assert_error_contains(report, "非有限")

    def test_points_empty_separator_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<polyline points="0 0, 10 10,"/>')
        )
        self.assert_error_contains(report, "points")

    def test_malformed_transform_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect transform="rotate(not-a-number)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "transform")

    def test_non_finite_transform_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect transform="translate(1e999 1)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "非有限")

    def test_transform_empty_separator_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect transform="translate(10,,20)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "transform")

    def test_transform_function_separator_is_required(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect transform="translate(10 20)rotate(45)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "transform")

    def test_whitespace_separated_transform_functions_are_valid(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect transform="translate(10 20) rotate(45)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assertEqual((), report.errors)

    def test_non_finite_css_geometry_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect style="transform: translateX(1e999px)" '
                'x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "非有限")

    def test_non_finite_css_stroke_width_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<style>.shape { stroke-width: 1e999; }</style>'
                '<path class="shape" d="M 0 0 H 10"/>'
            )
        )
        self.assert_error_contains(report, "非有限")

    def test_non_finite_gradient_transform_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><linearGradient id="g" gradientTransform="translate(1e999 0)">'
                '<stop offset="0" stop-color="#fff"/>'
                '</linearGradient></defs>'
                '<rect x="0" y="0" width="10" height="10" fill="url(#g)"/>'
            )
        )
        self.assert_error_contains(report, "非有限")

    def test_non_finite_nested_viewbox_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<svg x="0" y="0" width="10" height="10" viewBox="0 0 1e999 1">'
                '<rect x="0" y="0" width="1" height="1"/>'
                '</svg>'
            )
        )
        self.assert_error_contains(report, "viewBox")

    def test_arc_flags_must_be_binary(self) -> None:
        report = self.validate_text(
            self.standalone_svg('<path d="M 0 0 A 10 10 0 2 0 20 20"/>')
        )
        self.assert_error_contains(report, "标志位")

    def test_smil_cannot_mutate_a_reference_to_an_external_resource(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<defs><rect id="shape" width="10" height="10"/></defs>'
                '<use href="#shape">'
                '<animate attributeName="href" '
                'to="https://example.invalid/external.svg#shape" dur="1s"/>'
                '</use>'
            )
        )
        self.assert_error_contains(report, "动画元素")

    def test_legacy_animate_color_is_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect x="0" y="0" width="10" height="10" fill="#fff">'
                '<animateColor attributeName="fill" values="#fff;#000" dur="1s"/>'
                '</rect>'
            )
        )
        self.assert_error_contains(report, "动画元素")

    def test_compact_arc_flags_and_coordinate_are_valid(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<path d="M 0 0 A 30 50 0 01162.55 162.45"/>'
            )
        )
        self.assertEqual((), report.errors)

    def test_event_handlers_are_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect onload="alert(1)" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "事件处理属性")

    def test_foreign_elements_outside_metadata_are_rejected(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<html:div xmlns:html="http://www.w3.org/1999/xhtml">unsafe</html:div>'
            )
        )
        self.assert_error_contains(report, "不在 SVG 命名空间")

    def test_aria_id_references_must_resolve(self) -> None:
        report = self.validate_text(
            self.standalone_svg(
                '<rect aria-describedby="missing" x="0" y="0" width="10" height="10"/>'
            )
        )
        self.assert_error_contains(report, "aria-describedby")

    def test_decorative_svg_does_not_require_title(self) -> None:
        text = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"
     width="10" height="10" aria-hidden="true">
  <circle cx="5" cy="5" r="4"/>
</svg>"""
        report = self.validate_text(text)
        self.assertEqual((), report.errors)
        self.assertFalse(any("<title>" in warning for warning in report.warnings))

    def test_nested_title_does_not_replace_the_document_title(self) -> None:
        text = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"
     width="10" height="10">
  <g><title>Only the group has a title</title></g>
</svg>"""
        report = self.validate_text(text)
        self.assertTrue(any("<title>" in warning for warning in report.warnings))

    def test_broken_cairosvg_install_is_reported_as_unavailable(self) -> None:
        with mock.patch.object(
            SVG_PREFLIGHT, "import_module", side_effect=OSError("missing native cairo")
        ):
            spec, reason = SVG_PREFLIGHT.probe_renderer("cairosvg")
        self.assertIsNone(spec)
        self.assertIn("missing native cairo", reason)

    def test_white_browser_screenshot_is_not_accepted_silently(self) -> None:
        try:
            from PIL import Image
        except ImportError:
            self.skipTest("Pillow is not available")

        with tempfile.TemporaryDirectory(prefix="svg-white-render-test-") as directory:
            output = Path(directory) / "blank.png"
            Image.new("RGBA", (100, 100), (255, 255, 255, 255)).save(output)
            errors, warnings = SVG_PREFLIGHT.inspect_png(output)
        self.assertEqual([], errors)
        self.assertTrue(any("全白" in warning for warning in warnings))

    def test_failed_render_preserves_an_existing_preview(self) -> None:
        svg_path = SKILL_ROOT / "examples" / "good-diagram.svg"
        validation = SVG_PREFLIGHT.validate(svg_path)
        fake_renderer = SVG_PREFLIGHT.RendererSpec("browser", executable="fake")

        with tempfile.TemporaryDirectory(prefix="svg-render-failure-test-") as directory:
            output = Path(directory) / "preview.png"
            output.write_bytes(b"previous preview")
            with mock.patch.object(
                SVG_PREFLIGHT,
                "select_renderer",
                return_value=(fake_renderer, None),
            ), mock.patch.object(
                SVG_PREFLIGHT,
                "render_with_browser",
                return_value="simulated failure",
            ):
                render = SVG_PREFLIGHT.render_svg(
                    svg_path,
                    output,
                    "auto",
                    validation.root,
                )
            self.assertTrue(render.errors)
            self.assertEqual(b"previous preview", output.read_bytes())
            self.assertEqual([], list(Path(directory).glob(".preview-*")))

    def test_render_cannot_overwrite_the_source_svg(self) -> None:
        with tempfile.TemporaryDirectory(prefix="svg-same-file-test-") as directory:
            source = Path(directory) / "source.svg"
            source.write_text(
                self.standalone_svg('<circle cx="50" cy="50" r="20"/>'),
                encoding="utf-8",
            )
            original = source.read_bytes()
            validation = SVG_PREFLIGHT.validate(source)
            render = SVG_PREFLIGHT.render_svg(
                source,
                source,
                "auto",
                validation.root,
            )
            self.assertTrue(render.errors)
            self.assertEqual(original, source.read_bytes())

    def test_render_pixel_limit_is_checked_before_selecting_a_backend(self) -> None:
        text = """<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 8000 5000" width="8000" height="5000">
  <title>Large canvas</title>
  <rect width="8000" height="5000"/>
</svg>"""
        with tempfile.TemporaryDirectory(prefix="svg-render-limit-test-") as directory:
            source = Path(directory) / "large.svg"
            output = Path(directory) / "large.png"
            source.write_text(text, encoding="utf-8")
            validation = SVG_PREFLIGHT.validate(source)
            with mock.patch.object(SVG_PREFLIGHT, "select_renderer") as select_renderer:
                render = SVG_PREFLIGHT.render_svg(
                    source,
                    output,
                    "auto",
                    validation.root,
                )
            select_renderer.assert_not_called()
            self.assertTrue(any("像素" in error for error in render.errors))
            self.assertFalse(output.exists())

    def test_auto_render_uses_an_available_backend_without_repo_writes(self) -> None:
        spec, reason = SVG_PREFLIGHT.select_renderer("auto")
        if spec is None:
            self.skipTest(reason or "No renderer available")

        svg_path = SKILL_ROOT / "examples" / "good-diagram.svg"
        validation = SVG_PREFLIGHT.validate(svg_path)
        with tempfile.TemporaryDirectory(prefix="svg-render-test-") as directory:
            output = Path(directory) / "preview.png"
            render = SVG_PREFLIGHT.render_svg(svg_path, output, "auto", validation.root)
            self.assertEqual((), render.errors)
            self.assertEqual((), render.warnings)
            self.assertEqual(spec.name, render.renderer)
            self.assertTrue(output.is_file())
            self.assertGreater(output.stat().st_size, 0)


if __name__ == "__main__":
    unittest.main()
