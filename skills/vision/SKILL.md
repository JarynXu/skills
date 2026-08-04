---
name: vision
description: Describe, analyze, or OCR images using an external vision API (default Alibaba Cloud Bailian Qwen VL) when the underlying model lacks native image understanding. Use when the user shares a local image path, an image URL, or a "Saved attachments:" list, or asks to describe, analyze, or read text from an image. Do NOT use when the current model already has native vision capability (e.g. Claude Opus/Sonnet/Haiku).
---

# Vision（外部识图）

本技能让没有原生识图能力的模型也能"看图"：把图片转成 base64 发送给支持视觉的模型 API（走 OpenAI 兼容格式，默认阿里云百炼千问），用文字描述返回。

## When to use

- 用户分享本地图片路径或网络图片 URL，要求分析、描述、识别内容；
- 消息中出现 `Saved attachments:` 并列出图片；
- 用户要求读取图片中的文字（OCR）、识别物体、判断截图内容等。

**不要使用**：当前模型本身具备原生图像理解能力时（如 Claude Opus/Sonnet/Haiku），直接查看图片即可，不要调用本技能。

## 首次配置（一次性）

脚本从环境变量读取配置，不把密钥写死在脚本里。

1. 申请 API Key：阿里云百炼 https://bailian.console.aliyun.com/ （新用户 100 万 token 免费，约 0.02 元/次）
2. 配置环境变量，二选一：
   - 在 shell 中：`export DASHSCOPE_API_KEY=sk-xxx`
   - 或在工作目录放 `.env` 文件（脚本会自动加载当前目录或脚本目录下的 `.env`）

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `DASHSCOPE_API_KEY` | 无（必填） | 阿里云百炼 API Key |
| `VISION_MODEL` | 无（必填） | 模型名，如 `qwen3.5-omni-plus`、`qwen-vl-max` |
| `DASHSCOPE_BASE_URL` | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 使用其他 OpenAI 兼容服务时改为对应地址 |

## 用法

```bash
node scripts/vision.js "<图片路径>" "用中文描述这张图片"
node scripts/vision.js --url "<图片链接>" "这张图片里有什么？"
```

脚本位于本技能目录的 `scripts/vision.js`（技能安装目录：全局 `~/.claude/skills/vision/` 或项目 `.claude/skills/vision/`）。

## 模型选项

| 服务 | 模型 | 备注 |
|---|---|---|
| 阿里云百炼（默认） | `qwen3.5-omni-plus` / `qwen-vl-max` | 新用户免费额度 |
| OpenAI | `gpt-4o-mini` | 需改 `DASHSCOPE_BASE_URL` 为 OpenAI 地址 |
| 其他 | 任何 OpenAI 兼容 vision API | 改 `DASHSCOPE_BASE_URL` 和模型名即可 |

## 验证

配置完成后直接给 AI 发一张图片，应能收到文字描述。失败时检查：`DASHSCOPE_API_KEY` 是否已配置、模型名是否正确、网络是否能访问 API 地址。
