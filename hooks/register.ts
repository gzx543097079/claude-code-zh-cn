import type { Register } from 'claude-code'

const commandDescriptions: Record<string, string> = {
  help: '显示帮助',
  clear: '清空当前对话',
  compact: '压缩当前对话的上下文',
  config: '打开设置或修改指定设置',
  context: '查看上下文使用情况',
  cost: '查看本次会话的费用',
  doctor: '检查安装和配置',
  exit: '退出 Claude Code',
  export: '导出当前对话',
  init: '为当前项目创建 CLAUDE.md',
  login: '登录账号',
  logout: '退出账号',
  mcp: '管理 MCP 服务器',
  memory: '查看或编辑记忆',
  model: '选择模型',
  permissions: '查看和管理权限',
  plugin: '管理插件',
  resume: '恢复对话',
  status: '查看状态',
  usage: '查看用量',
  'add-dir': '添加工作目录',
  'cloud-plugins': '选择云端会话是否使用本机启用的插件',
  'auto-mode-setup': '为 auto mode 配置环境和规则',
  'autofix-pr': '监控并自动修复当前 PR 的问题',
  btw: '提一个不打断当前对话的简短问题',
  feedback: '发送反馈或报告问题',
  bug: '报告问题或分享对话',
  cd: '更改当前会话的工作目录',
  color: '设置本次会话的输入框颜色',
  copy: '复制 Claude 的回复到剪贴板，可指定回复序号',
  autocompact: '设置自动压缩的上下文阈值',
  ide: '管理 IDE 集成并查看状态',
  import: '从其他 AI 编程工具导入配置',
  keybindings: '打开快捷键配置文件',
  'design-consent': '授予 Claude 代理访问 Design 项目的权限',
  'design-revoke': '撤销 Claude 代理访问 Design 项目的权限',
  'design-login': '使用 claude.ai 账号授权访问设计系统',
  'install-github-app': '为仓库配置 Claude GitHub Actions',
  'install-slack-app': '安装 Claude Slack 应用',
  voice: '切换语音模式',
  powerup: '通过互动课程了解 Claude Code 功能',
  'setup-bedrock': '重新配置 Amazon Bedrock 认证、区域或模型',
  'setup-vertex': '重新配置 Google Vertex AI 认证、项目、区域或模型',
  'scroll-speed': '调整鼠标滚轮速度',
  skills: '列出可用技能',
  'team-onboarding': '根据你的使用情况生成团队上手指南',
  teleport: '将会话发送到云端或从 claude.ai 恢复会话',
}

const configLabels: Record<string, string> = {
  theme: '主题', remoteControl: '为所有会话启用远程控制',
  defaultToAgentsView: '默认打开 Agent 视图', notifChannel: '本地通知',
  inputNeededNotifEnabled: '需要操作时发送推送', agentPushNotifEnabled: '由 Claude 决定何时推送',
  autoCompact: '自动压缩', idleCompaction: '空闲时压缩',
  autoContinueAtUsageLimit: '达到用量上限后自动继续', remoteHomeSettings: '云端会话使用本机设置',
  unattendedServing: '允许云端会话在本机执行无人值守命令', tips: '显示提示',
  feedbackDrafts: '由 Claude 起草反馈', reduceMotion: '减少动态效果', thinking: '思考模式',
  promptSuggestionEnabled: '提示建议', recap: '会话回顾', checkpoints: '代码回退（检查点）',
  orgMemoryRead: '同步项目记忆（当前目录；下次会话生效）', workflows: '动态工作流',
  workflowKeywordTriggerEnabled: 'Ultracode 关键词触发', workflowSizeGuideline: '动态工作流规模',
  artifacts: 'Artifacts', progressBar: '终端进度条', showStatusInTerminalTab: '在终端标签显示状态',
  turnDuration: '显示回合耗时', precomputeCompactionEnabled: '提前生成压缩摘要',
  timestamps: '显示消息时间戳', timeFormat: '时间格式', permissionMode: '默认权限模式',
  worktreeBaseRef: 'Worktree 基准引用', useAutoModeDuringPlan: '计划期间使用 auto mode',
  gitignore: '文件选择器遵循 .gitignore', copyFullResponse: '跳过 /copy 选择器',
  copyOnSelect: '选中即复制', agentsView: 'Agent 视图', autoUpdatesChannel: '自动更新渠道',
  outputStyle: '输出风格', defaultView: '默认视图', language: '语言', editor: '编辑器模式',
  askUserQuestionTimeout: '问题自动继续的等待时间', modelProposedGoals: 'Claude 提议的目标',
  model: '模型', diffTool: 'Diff 工具', autoConnectIde: '自动连接 IDE（外部终端）',
  autoInstallIdeExtension: '自动安装 IDE 扩展', dialogExpiry: '对话框过期时间',
  crossSessionInbound: '来自其他会话的消息',
}

const modeLabels: Record<string, string> = {
  'memory paused': '记忆已暂停',
  'account memory: read-only': '账户记忆：只读',
  'account memory: off': '账户记忆：关闭',
}

const spinnerMessages: Record<string, string> = {
  'Running SessionStart hooks…': '正在运行 SessionStart hooks…',
  'Running PreCompact hooks…': '正在运行 PreCompact hooks…',
  'Running PostCompact hooks…': '正在运行 PostCompact hooks…',
  'Compacting conversation': '正在压缩对话',
}

function lookup(table: Record<string, string>, key: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(table, key) ? table[key] : undefined
}

export const register: Register = (on) => {
  on('command.describe', ($, e, next) => {
    const description = e.provider.plugin === 'engine' ? lookup(commandDescriptions, e.command) : undefined
    return description ? next({ ...e, description }) : next(e)
  })

  on('config.describe', ($, e, next) => {
    const label = e.provider.plugin === 'engine' ? lookup(configLabels, e.key) : undefined
    return label ? next({ ...e, label }) : next(e)
  })

  on('ui.render', { component: 'Spinner' }, ($, e, next) => {
    if (e.surface !== 'terminal') return next(e)
    if (e.props.message !== null) {
      const message = lookup(spinnerMessages, e.props.message)
      return message ? next({ ...e, props: { ...e.props, message } }) : next(e)
    }
    return next({ ...e, props: { ...e.props, word: '处理中' } })
  })

  on('ui.render', { component: 'ToolProgress' }, ($, e, next) => {
    const match = /^\(([^()]+) to run in background\)$/.exec(e.props.hint)
    return match ? next({ ...e, props: { ...e.props, hint: `（${match[1]} 转入后台）` } }) : next(e)
  })

  on('ui.render', { component: 'InfoNotice' }, ($, e, next) => {
    let text: string | undefined
    if (e.props.text === 'New here? Type /powerup for a 5-minute tour — modes, undo, @-mentions, and how to teach Claude your rules.') {
      text = '初次使用？输入 /powerup，花 5 分钟了解模式、撤销、@ 提及，以及如何让 Claude 遵循你的规则。'
    } else if (e.props.command === '/model' && e.props.text.startsWith('Using ')) {
      text = `正在使用 ${e.props.text.slice(6)}`
    } else {
      const hidden = /^(\d+) more notices? hidden$/.exec(e.props.text)
      if (hidden) text = `还有 ${hidden[1]} 条通知已隐藏`
    }
    return text ? next({ ...e, props: { ...e.props, text } }) : next(e)
  })

  on('ui.render', { component: 'CommandOutput' }, ($, e, next) => {
    const original = e.props.text
    if (['usage', 'cost', 'stats'].includes(e.props.command)) {
      if (original === 'You are currently using your subscription to power your Claude Code usage') return next({ ...e, props: { ...e.props, text: '当前 Claude Code 用量由订阅提供' } })
      if (original === 'You are currently using your overages to power your Claude Code usage. We will automatically switch you back to your subscription rate limits when they reset') return next({ ...e, props: { ...e.props, text: '当前 Claude Code 用量使用超额额度。订阅限额重置后，将自动切回订阅额度。' } })
      const lines = original.split('\n')
      if (lines.length < 4 || !/^Total cost:\s+/.test(lines[0]) || !/^Total duration \(API\):\s+/.test(lines[1]) || !/^Total duration \(wall\):\s+/.test(lines[2])) return next(e)
      const changes = /^Total code changes:\s+(\d+) lines? added, (\d+) lines? removed$/.exec(lines[3])
      if (!changes) return next(e)
      lines[0] = lines[0].replace(/^Total cost:\s+/, '总费用：')
      lines[1] = lines[1].replace(/^Total duration \(API\):\s+/, 'API 总耗时：')
      lines[2] = lines[2].replace(/^Total duration \(wall\):\s+/, '实际总耗时：')
      lines[3] = `代码改动：增加 ${changes[1]} 行，删除 ${changes[2]} 行`
      return next({ ...e, props: { ...e.props, text: lines.join('\n') } })
    }
    if (e.props.command === 'export') {
      let text: string | undefined
      if (original === 'Export cancelled') text = '已取消导出'
      else if (original.startsWith('Conversation exported to: ')) text = `对话已导出至：${original.slice('Conversation exported to: '.length)}`
      else if (original.startsWith('Failed to export conversation: ')) text = `导出对话失败：${original.slice('Failed to export conversation: '.length)}`
      return text ? next({ ...e, props: { ...e.props, text } }) : next(e)
    }
    if (e.props.command !== 'copy') return next(e)
    let text: string | undefined
    if (original === 'No assistant message to copy') text = '没有可复制的助手消息'
    else if (original === 'Copy cancelled') text = '已取消复制'
    else if (original.startsWith('Written to ')) text = `已写入：${original.slice('Written to '.length)}`
    else if (original.startsWith('Failed to write file: ')) text = `写入文件失败：${original.slice('Failed to write file: '.length)}`
    else if (original.startsWith('Usage: /copy [N] where N is 1 (latest), 2, 3, … Got: ')) text = `用法：/copy [N]，N 为 1（最新）、2、3 等。收到：${original.slice('Usage: /copy [N] where N is 1 (latest), 2, 3, … Got: '.length)}`
    else {
      const count = /^Only (\d+) assistant messages? available to copy$/.exec(original)
      const copied = /^Copied to clipboard \((\d+) characters, (\d+) lines\)$/.exec(original)
      if (count) text = `只有 ${count[1]} 条助手消息可供复制`
      else if (copied) text = `已复制到剪贴板（${copied[1]} 个字符，${copied[2]} 行）`
    }
    return text ? next({ ...e, props: { ...e.props, text } }) : next(e)
  })

  on('ui.render', { component: 'SessionMode' }, ($, e, next) => {
    const modes = e.props.modes.map(mode => lookup(modeLabels, mode) ?? mode)
    return next({ ...e, props: { ...e.props, modes } })
  })

}
