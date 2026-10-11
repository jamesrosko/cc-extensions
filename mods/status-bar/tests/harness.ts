import { register } from '../hooks/register'

type Handler = (...args: any[]) => any
type Usage = { context: { percent?: number }; cost?: { usd: number } }

export type Opts = {
  model?: string
  usage?: Usage
  clock?: number
}

// Registers the mod against a fake `on` and returns its handlers plus a fake `$`.
export function setup(opts: Opts = {}) {
  const handlers: Record<string, Handler> = {}
  register(((event: string, a: unknown, b?: Handler) => {
    const render = typeof a === 'object' && (a as any).component
    handlers[render ? `${event}:${(a as any).component}` : event] = (b ?? a) as Handler
  }) as any)

  const ticks: Array<{ ms: number; fn: () => Promise<void> }> = []
  const env = { clock: opts.clock ?? 0, usage: opts.usage ?? { context: {} } }
  const $ = {
    store: new Map(),
    session: { model: async () => opts.model ?? '', usage: async () => env.usage },
    clock: {
      now: async () => env.clock,
      every: (ms: number, fn: () => Promise<void>) => ticks.push({ ms, fn }),
    },
    ui: { resolve: () => ({ Box: 'Box', Text: 'Text' }) },
  }
  return { handlers, $, ticks, env }
}

// Runs a `turn.step` generator handler to completion.
export async function runStep(h: Handler, $: unknown, e: object, result: unknown = 'done') {
  const next = async function* () {
    return result
  }
  const gen = h($, e, next)
  let r = await gen.next()
  while (!r.done) r = await gen.next()
  return r.value
}

// Walks a rendered tree collecting coloured Text leaves (the status parts).
export function parts(node: any): Array<{ text: string; color: string }> {
  const out: Array<{ text: string; color: string }> = []
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return
    if (n.type === 'Text' && n.props.color) {
      out.push({ text: n.children.join(''), color: n.props.color })
    }
    n.children?.forEach(walk)
  }
  walk(node)
  return out
}

export const separators = (node: any): number => {
  let count = 0
  const walk = (n: any) => {
    if (!n || typeof n !== 'object') return
    if (n.props?.dimColor) count++
    n.children?.forEach(walk)
  }
  walk(node)
  return count
}
