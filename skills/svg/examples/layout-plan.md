# SVG 布局计划模板

在写 SVG 前先填写：

```text
Canvas: 1200 × 700
Safe margin: 48
Main layout: horizontal grid

Element     x     y     width  height  center_x  center_y
Title       60    36    1080   64      600       68
Node A      80    220   280    140     220       290
Node B      460   220   280    140     600       290
Node C      840   220   280    140     980       290

Horizontal gap: 100
Node padding: 24
Font sizes: title 32, node title 22, body 16
Connector anchors: A.right -> B.left; B.right -> C.left
```

生成后验证：

```bash
python scripts/svg_preflight.py output.svg --render output.png --strict
```
