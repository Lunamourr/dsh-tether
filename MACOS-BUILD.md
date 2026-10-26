# macOS 客户端构建（个人分支）

这个分支只放构建产物，源码改动在 `macos-client` 分支（基于上游 `v0.1.24`）。

## 下载

- Release：[v0.1.24-macos.1](https://github.com/Lunamourr/dsh-tether/releases/tag/v0.1.24-macos.1)
- 直接下载：[DSH Tether_0.1.24_universal.dmg](https://github.com/Lunamourr/dsh-tether/blob/macos-dist/DSH%20Tether_0.1.24_universal.dmg)（17.5 MB，universal：arm64 + x86_64）
- 旧版 0.1.23 的包保留在 Release `v0.1.23-macos.1`

## 源码改动（macos-client）

只动了两个文件：

- `app/src-tauri/tauri.conf.json`：窗口 420x780 → 1200x820，最小 900x600；新增 `bundle.icon` 引用仓库现有图标。保留上游的 `create: false`
- `app/src-tauri/Info.plist`：新增 `NSAppTransportSecurity/NSAllowsLocalNetworking` 与 `NSLocalNetworkUsageDescription`，否则 WKWebView 加载 `http://127.0.0.1:<port>` 会白屏

## 图标

复用仓库已有的 `app/src-tauri/icons/`（源图 `app/src-tauri/app-icon.png`，黑色虎鲸），不做重新生成。构建产物里的 `Contents/Resources/icon.icns` 与仓库文件逐字节一致，`Info.plist` 写入 `CFBundleIconFile = icon.icns`。

## 构建

GitHub Actions 工作流 `build-macos-app`（在 `main`）：

- 运行方式：Actions → build-macos-app → Run workflow，`ref` 填 `macos-client`
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

## 与 0.1.23 版的差别

- 含上游 0.1.24 的连接层修复：断连上报、代理端口释放、来源稳定、旧连接不误杀
- 不含任何前端重连补丁（该问题由上游在 Rust 层修复，PR #21 已关闭）

## 说明

- 仅远程客户端，不含本地模式（未打包 macOS 运行时）。
