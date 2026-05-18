---
name: GrsAI MCP + 主图合成
description: GrsAI（grsai.dakka.com.cn）MCP 配置、图片合成脚本、产品特征坐标和标注参数
type: reference
originSessionId: 541a68f0-c469-4149-9db9-e90766adc834
---
## GrsAI MCP

- MCP 服务器: `C:\Users\Administrator\.claude\mcp-servers\grsai\server.mjs`
- API Key: `sk-5d0b88ba7e0945d79213682dc06e0119`
- API Base: `https://grsai.dakka.com.cn`
- 可用模型: `nano-banana`, `gpt-image-2`
- `nano-banana-pro` 不可用 (404)
- 图片保存目录: `D:\ClaudeWorkspace\01_P4P\主图素材`

## 合成脚本

- `compose.cjs` — 用 sharp 将产品图合成为 1600x1600 带标注的主图
- 输出: `D:\ClaudeWorkspace\01_P4P\主图素材\连体衣_主图_标注版.png`
- 产品图来源: `C:\Users\Administrator\Desktop\222\`

## 分析脚本

- `detect.cjs` — 特征检测（拉链、袖口、领口等坐标识别）
- `analyze.cjs` / `analyze2.cjs` — 色彩、布局、标注元素分析

## 产品特征坐标 (800x800 产品图)

| 特征 | 坐标 |
|------|------|
| 双向拉链 | x≈421, y=100~745 |
| 手部翻转袖口 | ~(100, 300) |
| 脚部翻转裤脚 | ~(175, 690) |
| 领口拉链盖 | ~(421, 140) |
| 领口尺码标 | ~(320, 80) |
