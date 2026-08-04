#!/usr/bin/env node
/**
 * 独立识图脚本 — 调用支持 vision 的 OpenAI 兼容 API（默认阿里云百炼千问）。
 *
 * 用法:
 *   node vision.js <图片路径> [问题]
 *   node vision.js --url <图片链接> [问题]
 *
 * 配置优先级（高 → 低）:
 *   1. 环境变量
 *   2. 当前工作目录的 .env
 *   3. 脚本所在目录的 .env
 */

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 解析 .env 文件内容为键值对象。
 * 支持: KEY=value、KEY="value"、KEY='value'、空行、# 注释。
 */
function parseDotenv(text) {
  const result = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function loadEnv() {
  const env = { ...process.env };
  const candidates = [".env", path.resolve(__dirname, ".env")];
  for (const file of candidates) {
    try {
      const text = fs.readFileSync(file, "utf8");
      const parsed = parseDotenv(text);
      for (const [key, value] of Object.entries(parsed)) {
        // 不覆盖已有的环境变量（与环境变量同优先级逻辑一致）
        if (process.env[key] === undefined) env[key] = value;
      }
      break; // 找到并成功解析第一个 .env 后停止
    } catch {
      // 文件不存在或不可读，尝试下一个候选
    }
  }
  return env;
}

const env = loadEnv();
const BASE_URL = env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const API_KEY = env.DASHSCOPE_API_KEY || "";
const MODEL = env.VISION_MODEL || "";

function parseArgs() {
  const argv = process.argv.slice(2);
  let imageSource = "", prompt = "", isUrl = false;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url" && argv[i + 1]) {
      isUrl = true;
      imageSource = argv[++i];
    } else if (!imageSource && !argv[i].startsWith("--")) {
      imageSource = argv[i];
    } else if (imageSource && !argv[i].startsWith("--")) {
      prompt = prompt ? prompt + " " + argv[i] : argv[i];
    }
  }
  if (!prompt) prompt = "请详细描述这张图片的内容。";
  return { imageSource, prompt, isUrl };
}

function resolveImageUrl(source, isUrl) {
  if (isUrl) return source;
  const resolved = path.resolve(source);
  if (!fs.existsSync(resolved)) throw new Error(`文件不存在: ${resolved}`);
  const ext = path.extname(resolved).toLowerCase().replace(".", "");
  const mimeMap = { jpg: "jpeg", jpeg: "jpeg", png: "png", gif: "gif", webp: "webp", bmp: "bmp" };
  const data = fs.readFileSync(resolved);
  return `data:image/${mimeMap[ext] || "jpeg"};base64,${data.toString("base64")}`;
}

function request(payload) {
  const url = new URL(BASE_URL.replace(/\/?$/, "/") + "chat/completions");
  const body = JSON.stringify(payload);
  const transport = url.protocol === "https:" ? https : http;

  return new Promise((resolve, reject) => {
    const req = transport.request(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let data = "";
      res.on("data", (c) => data += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`API ${res.statusCode}: ${data.slice(0, 300)}`));
        try {
          resolve(JSON.parse(data)?.choices?.[0]?.message?.content || data);
        } catch { resolve(data); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  if (!API_KEY) {
    console.error("未配置 DASHSCOPE_API_KEY。请设置环境变量或在 .env 文件中配置。");
    console.error("获取 Key: https://bailian.console.aliyun.com/");
    process.exit(1);
  }
  if (!MODEL) {
    console.error("未配置 VISION_MODEL。请设置环境变量或在 .env 文件中配置。");
    console.error("示例: VISION_MODEL=qwen3.5-omni-plus");
    process.exit(1);
  }
  const { imageSource, prompt, isUrl } = parseArgs();
  if (!imageSource) {
    console.error("用法: node vision.js <图片路径> [问题]");
    console.error("      node vision.js --url <图片链接> [问题]");
    process.exit(1);
  }
  try {
    const imageUrl = resolveImageUrl(imageSource, isUrl);
    const result = await request({
      model: MODEL,
      messages: [{ role: "user", content: [
        { type: "image_url", image_url: { url: imageUrl } },
        { type: "text", text: prompt },
      ]}],
      stream: false,
      max_tokens: 1024,
    });
    console.log(result);
  } catch (err) {
    console.error("识图失败:", err.message);
    process.exit(1);
  }
}

main();
