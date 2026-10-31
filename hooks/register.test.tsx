import { expect, test } from 'claude-code/testing'

test('命令和设置只翻译已知内置项目', async ($, on) => {
  on('command.describe', (_, e) => ({ description: e.description, argumentHint: e.argumentHint, isHidden: e.isHidden }))
  on('config.describe', (_, e) => ({ label: e.label, description: e.description, isHidden: e.isHidden }))
  const core = { plugin: 'engine', tier: 'core' } as const
  const thirdParty = { plugin: 'other', tier: 'user' } as const
  const command = { command: 'help', description: 'Original', argumentHint: '[topic]', isHidden: false, immediate: false, provider: core }
  expect((await $.command.describe(command)).description).toBe('显示帮助')
  expect((await $.command.describe({ ...command, provider: thirdParty })).description).toBe('Original')
  expect((await $.command.describe({ ...command, command: 'constructor' })).description).toBe('Original')
  const setting = { key: 'theme', label: 'Theme', description: 'Help', isHidden: false, provider: core }
  expect((await $.config.describe(setting)).label).toBe('主题')
  expect((await $.config.describe({ ...setting, provider: thirdParty })).label).toBe('Theme')
  expect((await $.config.describe({ ...setting, key: 'toString' })).label).toBe('Theme')
})

test('后台提示保留实际快捷键和未知格式', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{e.component === 'ToolProgress' ? e.props.hint : ''}</Text>
  })
  const base = { plugin: 'hanzi-interface', surface: 'terminal', component: 'ToolProgress' } as const
  for (const [hint, expected] of [['(ctrl+b to run in background)', '（ctrl+b 转入后台）'], ['(ctrl+b (twice) to run in background)', '(ctrl+b (twice) to run in background)']]) {
    const view = await $.ui.mount({ ...base, props: { kind: 'background_hint', tool_use_id: 'tool-1', hint } })
    expect((await view.find({ type: 'Text' }))?.text).toBe(expected)
    await view.unmount()
  }
})

test('复制结果按完整文本翻译，不影响其他命令和额外提示', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{e.component === 'CommandOutput' ? e.props.text : ''}</Text>
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const base = { plugin: 'hanzi-interface', surface, component: 'CommandOutput' } as const
    const cases = [
      { command: 'copy', text: 'No assistant message to copy', expected: '没有可复制的助手消息' },
      { command: 'copy', text: 'Copied to clipboard (23 characters, 2 lines)', expected: '已复制到剪贴板（23 个字符，2 行）' },
      { command: 'copy', text: 'Only 1 assistant message available to copy', expected: '只有 1 条助手消息可供复制' },
      { command: 'copy', text: 'Copied to clipboard (23 characters, 2 lines)\nAlso written to /tmp/a', expected: 'Copied to clipboard (23 characters, 2 lines)\nAlso written to /tmp/a' },
      { command: 'other', text: 'No assistant message to copy', expected: 'No assistant message to copy' },
      { command: 'export', text: 'Conversation exported to: /tmp/中文.txt', expected: '对话已导出至：/tmp/中文.txt' },
      { command: 'export', text: 'Failed to export conversation: Permission denied', expected: '导出对话失败：Permission denied' },
      { command: 'copy', text: 'Failed to write file: /tmp/a: Permission denied', expected: '写入文件失败：/tmp/a: Permission denied' },
    ]
    for (const { command, text, expected } of cases) {
      const view = await $.ui.mount({ ...base, props: { command, text, args: '', isErrored: false } })
      expect((await view.find({ type: 'Text' }))?.text).toBe(expected)
      await view.unmount()
    }
  }
})

test('用量摘要保留数值、明细及未知格式', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{e.component === 'CommandOutput' ? e.props.text : ''}</Text>
  })
  const base = { plugin: 'hanzi-interface', surface: 'terminal', component: 'CommandOutput' } as const
  const text = 'Total cost:            $1.20\nTotal duration (API):  3s\nTotal duration (wall): 5s\nTotal code changes:    1 line added, 2 lines removed\nModel: example'
  const translated = '总费用：$1.20\nAPI 总耗时：3s\n实际总耗时：5s\n代码改动：增加 1 行，删除 2 行\nModel: example'
  const subscription = 'You are currently using your subscription to power your Claude Code usage'
  for (const [command, input, expected] of [['cost', text, translated], ['other', text, text], ['usage', text.replace('1 line added', 'unknown'), text.replace('1 line added', 'unknown')], ['usage', subscription, '当前 Claude Code 用量由订阅提供'], ['usage', `${subscription}\nextra`, `${subscription}\nextra`]]) {
    const view = await $.ui.mount({ ...base, props: { command, text: input, args: '', isErrored: false } })
    expect((await view.find({ type: 'Text' }))?.text).toBe(expected)
    await view.unmount()
  }
})

test('通知翻译保留模型和命令，未知内容不变', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>{e.component === 'InfoNotice' ? `${e.props.text}|${e.props.command ?? ''}` : ''}</Text>
  })
  const base = { plugin: 'hanzi-interface', surface: 'terminal', component: 'InfoNotice' } as const
  const cases = [
    { text: 'Using Sonnet (auto-updated)', command: '/model', expected: '正在使用 Sonnet (auto-updated)|/model' },
    { text: '2 more notices hidden', command: null, expected: '还有 2 条通知已隐藏|' },
    { text: 'Using custom text', command: null, expected: 'Using custom text|' },
  ]
  for (const { text, command, expected } of cases) {
    const view = await $.ui.mount({ ...base, props: { text, command } })
    expect((await view.find({ type: 'Text' }))?.text).toBe(expected)
    await view.unmount()
  }
})

test('终端的工作状态显示中文并保留状态提示', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    if (e.component === 'Spinner') return <Text>{e.props.message ?? e.props.word}</Text>
    return <Text>其他界面</Text>
  })

  const base = { plugin: 'hanzi-interface', surface: 'terminal', component: 'Spinner' } as const
  const spinner = await $.ui.mount({ ...base, props: { word: 'Working', message: null, suffix: '…', mode: 'thinking' } })
  expect((await spinner.find({ type: 'Text' }))?.text).toBe('处理中')
  await spinner.unmount()

  const notice = await $.ui.mount({ ...base, props: { word: 'Working', message: 'Retrying in 5s', suffix: '…', mode: 'requesting' } })
  expect((await notice.find({ type: 'Text' }))?.text).toBe('Retrying in 5s')
  await notice.unmount()
  const compact = await $.ui.mount({ ...base, props: { word: 'Working', message: 'Running PreCompact hooks…', suffix: '…', mode: 'thinking' } })
  expect((await compact.find({ type: 'Text' }))?.text).toBe('正在运行 PreCompact hooks…')
  await compact.unmount()
})

test('只翻译已知模式，保留原生快捷键提示', async ($, on) => {
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    if (e.component === 'SessionMode') return <Text>{e.props.modes.join(' & ')}</Text>
    if (e.component === 'PromptHint') return <Text>{e.props.hint}</Text>
    return <Text />
  })
  for (const surface of ['terminal', 'desktop'] as const) {
    const mode = await $.ui.mount({ plugin: 'hanzi-interface', surface, component: 'SessionMode', props: { modes: ['memory paused', 'custom'] } })
    expect((await mode.find({ type: 'Text' }))?.text).toBe('记忆已暂停 & custom')
    await mode.unmount()
    const hint = await $.ui.mount({ plugin: 'hanzi-interface', surface, component: 'PromptHint', props: { hint: '? for shortcuts', isDraft: false, isWorking: false } })
    expect((await hint.find({ type: 'Text' }))?.text).toBe('? for shortcuts')
    await hint.unmount()
  }
})
