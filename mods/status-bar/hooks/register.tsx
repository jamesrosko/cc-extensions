import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Info } from '../types'

// The prompt cache lives 5 minutes by default; each response refreshes it.
const CACHE_TTL_MS = 5 * 60 * 1000

const info = atom({ plugin: 'status-bar', key: 'info' } as const, {
  model: '',
  effort: '',
  lastResponseAt: 0,
} as Info)
const now = atom({ plugin: 'status-bar', key: 'now' } as const, 0)

type Part = { text: string; color: string }

// Higher effort burns more tokens, so it warms from green to red.
const EFFORT_COLORS: Record<string, string> = {
  low: 'green',
  medium: 'cyan',
  high: 'yellow',
  xhigh: 'magenta',
  max: 'red',
}

const shortModel = (id: string) => id.replace(/^claude-/, '').replace(/-\d{8}$/, '')

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const model = await $.session.model()
    await update($, info, i => ({ ...i, model }))
    // Redraw once a second so the cache countdown ticks.
    $.clock.every(1000, async () => {
      await update($, now, () => Date.now())
    })

    return next(e)
  })

  on('turn.step', async function* ($, e, next) {
    await update($, info, i => ({
      ...i,
      model: e.model,
      effort: e.effort === undefined ? '' : String(e.effort),
    }))
    const result = yield* next(e)
    const lastResponseAt = await $.clock.now()
    await update($, info, i => ({ ...i, lastResponseAt }))

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) {
      return next(e)
    }

    const [i, tick, usage, clock] = await Promise.all([
      read($, info),
      read($, now),
      $.session.usage(),
      $.clock.now(),
    ])
    const { Box, Text } = $.ui.resolve(e)

    const parts: Part[] = []
    if (i.model) {
      parts.push({
        text: shortModel(i.model) + (i.effort ? ` · ${i.effort}` : ''),
        color: EFFORT_COLORS[i.effort] ?? 'cyan',
      })
    }
    if (usage.context.percent !== undefined) {
      const pct = usage.context.percent
      parts.push({
        text: `ctx ${pct}%`,
        color: pct >= 85 ? 'red' : pct >= 60 ? 'yellow' : 'green',
      })
    }
    if (i.lastResponseAt > 0) {
      const left = CACHE_TTL_MS - (Math.max(clock, tick) - i.lastResponseAt)
      parts.push(
        left <= 0
          ? { text: 'cache cold', color: 'red' }
          : {
              text: `cache ${mmss(left)}`,
              color: left <= CACHE_TTL_MS * 0.2 ? 'red' : left <= CACHE_TTL_MS * 0.5 ? 'yellow' : 'green',
            },
      )
    }
    if (usage.cost) {
      const usd = usage.cost.usd
      parts.push({
        text: `$${usd.toFixed(2)}`,
        color: usd >= 10 ? 'red' : usd >= 3 ? 'yellow' : 'green',
      })
    }

    if (parts.length === 0) {
      return next(e)
    }

    return (
      <Box>
        {parts.map((p, n) => (
          <Text key={p.text.split(' ')[0]}>
            {n > 0 ? <Text dimColor>{'  │  '}</Text> : null}
            <Text color={p.color}>{p.text}</Text>
          </Text>
        ))}
      </Box>
    )
  })
}
