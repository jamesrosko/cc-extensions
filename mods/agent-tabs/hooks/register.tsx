import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Tab } from '../types'

const PANE = 'agent-tabs'
const MAIN = 'main'

const tabs = atom({ plugin: 'agent-tabs', key: 'tabs' } as const, [] as Tab[])
// Model per agent id, learned from each agent's turn steps; the main loop is 'main'.
const models = atom({ plugin: 'agent-tabs', key: 'models' } as const, {} as Record<string, string>)
const selected = atom({ plugin: 'agent-tabs', key: 'selected' } as const, MAIN)

const shortModel = (id: string) => id.replace(/^claude-/, '').replace(/-\d{8}$/, '')

const STATUS_COLORS: Record<string, string> = {
  running: 'green',
  idle: 'yellow',
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const model = await $.session.model()
    await update($, models, m => ({ ...m, [MAIN]: model }))
    // Agents come and go without an event of their own, so poll the roster.
    $.clock.every(2000, async () => {
      const agents = await $.agent.list()
      const roster: Tab[] = agents.map(a => ({
        id: a.id,
        name: a.name ?? a.description ?? a.type,
        status: a.status,
      }))
      await update($, tabs, () => roster)
    })

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    const key = e.agentId ?? MAIN
    await update($, models, m => (m[key] === e.model ? m : { ...m, [key]: e.model }))

    return yield* next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, tabs)
    if (e.props.hasSurvey || list.length === 0) {
      return next(e)
    }

    const [modelById, current] = await Promise.all([read($, models), read($, selected)])
    const { Box, Button, Text } = $.ui.resolve(e)

    const open = async (id: string) => {
      await update($, selected, () => id)
      await $.ui.open({ id: PANE, title: 'Agent', focus: true })
    }

    const label = (id: string, name: string) => {
      const model = modelById[id]

      return model ? `${name} · ${shortModel(model)}` : name
    }

    return (
      <Box>
        <Button
          key={MAIN}
          label={label(MAIN, 'main')}
          variant={current === MAIN ? 'primary' : 'secondary'}
          onPress={() => open(MAIN)}
        />
        {list.map(t => (
          <Text key={t.id}>
            <Text dimColor>{' '}</Text>
            <Button
              key={t.id}
              variant={current === t.id ? 'primary' : 'secondary'}
              onPress={() => open(t.id)}
            >
              <Text color={STATUS_COLORS[t.status] ?? 'gray'}>{'● '}</Text>
              {label(t.id, t.name)}
            </Button>
          </Text>
        ))}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const [id, list, modelById] = await Promise.all([read($, selected), read($, tabs), read($, models)])
    const tab = list.find(t => t.id === id)
    const name = id === MAIN ? 'main' : (tab?.name ?? id)
    const model = modelById[id]
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 4)

    let rows: { role: string; text: string }[] = []
    try {
      const found = await $.session.messages(id === MAIN ? {} : { agentId: id })
      rows = Array.isArray(found) ? found : []
    } catch {
      rows = []
    }
    const shown = rows.filter(r => r.text.trim() !== '').slice(-room)

    return (
      <Box flexDirection="column">
        <Text>
          <Text bold>{name}</Text>
          <Text dimColor>
            {model ? ` · ${shortModel(model)}` : ''}
            {tab ? ` · ${tab.status}` : ''}
          </Text>
        </Text>
        {shown.length === 0 && <Text dimColor>No messages to show for this agent yet.</Text>}
        {shown.map((r, n) => (
          <Text key={`${n}`} color={r.role === 'user' ? 'cyan' : undefined}>
            {r.role === 'user' ? '> ' : ''}
            {r.text.split('\n')[0]?.slice(0, 200)}
          </Text>
        ))}
      </Box>
    )
  })
}
