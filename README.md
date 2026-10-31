# Claude Code 中文界面

一个独立开发的 Claude Code 简体中文界面插件。插件使用 Claude Code 的界面 Hook 翻译部分内置命令说明、设置标签、状态提示和命令输出，不修改 Claude Code 程序文件。

## 安装

在 Claude Code 中运行：

```text
/plugin install hanzi-interface --marketplace gzx543097079/claude-code-zh-cn
```

按提示添加插件市场并选择安装范围，然后重新加载插件或重启会话。

## 覆盖范围

当前包含部分 `/config` 标签、内置命令描述、终端运行状态、后台提示、通知、`/copy`、`/export` 和用量摘要的中文显示。命令参数、设置值、文件路径、用户内容和未识别的文案保持原样。

**尚未实现完整汉化。** 当前插件接口不提供权限弹窗、`claude --help` 和部分设置选项值的翻译入口，这些位置仍可能显示英文。界面 Hook 是早期接口；本插件依据 Claude Code 2.1.316 开发，其他版本需要验证。

## 开发和测试

```sh
claude plugin validate .
claude plugin test .
```

界面测试使用模拟事件，不能代替在真实终端逐项验证。插件不依赖 CC Switch，也不复制现有中文插件的实现。

## 许可证

[MIT](LICENSE)
