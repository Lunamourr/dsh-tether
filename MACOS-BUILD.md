# macOS 客户端构建（个人分支）

这个分支只放构建产物，源码改动在 `feat/macos-client`。

## 下载

- Release：[v0.1.23-macos.1](https://github.com/Lunamourr/dsh-tether/releases/tag/v0.1.23-macos.1)
- 直接下载：[DSH Tether_0.1.23_universal.dmg](https://github.com/Lunamourr/dsh-tether/blob/macos-dist/DSH%20Tether_0.1.23_universal.dmg)（17.5 MB，universal：arm64 + x86_64）

## 源码改动（feat/macos-client）

- `app/src-tauri/tauri.conf.json`：窗口 420x780 → 1200x820，最小 900x600；新增 `bundle.icon` 引用仓库现有图标
- `app/src-tauri/Info.plist`：新增 `NSAppTransportSecurity/NSAllowsLocalNetworking` 与 `NSLocalNetworkUsageDescription`，否则 WKWebView 加载 `http://127.0.0.1:<port>` 会白屏

## 图标（复用手机端同一套）

仓库里本来就有整套图标，源图是 `app/src-tauri/app-icon.png`（黑色虎鲸），派生文件在 `app/src-tauri/icons/`：

- `icon.icns`（130,841 B）、`icon.ico`、32/64/128/128@2x PNG，以及 `android/`、`ios/` 各尺寸
- 上游 `tauri.conf.json` 从没配置 `bundle.icon`，所以 macOS 端一直用系统占位图标
- 修复方式只是在 `bundle.icon` 里列出这些文件，**不需要重新生成**：

```json
"bundle": {
  "icon": [
    "icons/32x32.png",
    "icons/128x128.png",
    "icons/128x128@2x.png",
    "icons/icon.icns",
    "icons/icon.ico"
  ]
}
```

构建产物里的 `Contents/Resources/icon.icns` 与仓库文件逐字节一致（git blob `471efff39189ac614263d69e7027adb3b12eb44d`），`Info.plist` 写入 `CFBundleIconFile = icon.icns`。

## 构建

GitHub Actions 工作流 `build-macos-app`（在 `main`）：

- 运行方式：Actions → build-macos-app → Run workflow，`ref` 填 `feat/macos-client`
- 命令：`pnpm exec tauri build --target universal-apple-darwin --bundles app,dmg`
- 产物路径：`target/universal-apple-darwin/release/bundle/{dmg,macos}`（仓库根 `target`，因为根 `Cargo.toml` 是 workspace）

## 安装

1. 挂载 dmg，把 `DSH Tether` 拖进 Applications；
2. 未签名、未公证，首次打开会被 Gatekeeper 拦：
   - 系统设置 → 隐私与安全性 → 安全性 → 「仍要打开」，或
   - 终端：
     ```bash
     xattr -dr com.apple.quarantine "/Applications/DSH Tether.app"
     codesign --force --deep --sign - "/Applications/DSH Tether.app"
     ```
3. 用 Windows 侧栏「连接手机」的配对串配对。

## 说明

- 仅远程客户端，不含本地模式（未打包 macOS 运行时）；
- 不含 `fix/resume-reconnect` 的探活补丁。
