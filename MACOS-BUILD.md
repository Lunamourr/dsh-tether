# macOS 客户端构建（个人分支）

这个分支只放构建产物，源码改动在 `feat/macos-client`。

## 下载

- Release：[v0.1.23-macos.1](https://github.com/Lunamourr/dsh-tether/releases/tag/v0.1.23-macos.1)
- 直接下载：[DSH Tether_0.1.23_universal.dmg](https://github.com/Lunamourr/dsh-tether/blob/macos-dist/DSH%20Tether_0.1.23_universal.dmg)（17.7 MB，universal：arm64 + x86_64）

## 源码改动（feat/macos-client）

- `app/src-tauri/tauri.conf.json`：窗口 420x780 → 1200x820，最小 900x600；`bundle.icon` 指向 `icons/*`
- `app/src-tauri/Info.plist`：新增 `NSAppTransportSecurity/NSAllowsLocalNetworking` 与 `NSLocalNetworkUsageDescription`，否则 WKWebView 加载 `http://127.0.0.1:<port>` 会白屏
- `app-icon.png`（仓库根）：1024x1024 图标源图

## 图标

Tauri 只有在 `bundle.icon` 里配置了 `icon.icns` 时才会写入 `CFBundleIconFile` 和 `Resources/icon.icns`，否则 App 显示系统占位图标。

生成方式：

```bash
cd app
pnpm exec tauri icon ../app-icon.png -o src-tauri/icons
```

CI 里已由 workflow 的 `Generate app icons` 步骤自动执行，本地构建前需要手动跑一次。

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
