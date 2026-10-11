import { describe, expect, it } from 'vitest'
import { parts, runStep, separators, setup, type Opts } from './harness'

const render = (s: ReturnType<typeof setup>, props: object = {}) => {
  const next = () => 'passthrough'
  return s.handlers['ui.render:AbovePrompt']!(s.$, { props }, next)
}

const passthrough = (e: object) => e

const withStep = async (opts: Opts, step: object = { model: 'claude-sonnet-4-20250514', effort: 'high' }) => {
  const s = setup(opts)
  await runStep(s.handlers['turn.step']!, s.$, step)
  return s
}

const cachePart = async (s: ReturnType<typeof setup>) =>
  parts(await render(s)).find(p => p.text.startsWith('cache'))

describe('session.start', () => {
  it('stores the session model and passes the event on', async () => {
    const s = setup({ model: 'claude-opus-4-1' })
    const out = await s.handlers['session.start']!(s.$, { id: 1 }, passthrough)
    expect(out).toEqual({ id: 1 })
    expect(parts(await render(s))).toEqual([{ text: 'opus-4-1', color: 'cyan' }])
  })

  it('starts a one-second redraw tick that records the time', async () => {
    const s = setup()
    await s.handlers['session.start']!(s.$, {}, passthrough)
    expect(s.ticks.map(t => t.ms)).toEqual([1000])
    await s.ticks[0]!.fn()
    expect([...s.$.store.values()].some(v => typeof v === 'number' && v > 0)).toBe(true)
  })
})

describe('turn.step', () => {
  it('returns the downstream result', async () => {
    const s = setup()
    expect(await runStep(s.handlers['turn.step']!, s.$, { model: 'm' }, 'abc')).toBe('abc')
  })

  it('treats an undefined effort as empty', async () => {
    const s = await withStep({}, { model: 'claude-haiku-4-5' })
    expect(parts(await render(s))).toEqual([{ text: 'haiku-4-5', color: 'cyan' }])
  })
})

describe('model and effort part', () => {
  it('strips the claude- prefix and date suffix', async () => {
    const s = await withStep({})
    expect(parts(await render(s))[0]!.text).toBe('sonnet-4 · high')
  })

  it.each([
    ['low', 'green'],
    ['medium', 'cyan'],
    ['high', 'yellow'],
    ['xhigh', 'magenta'],
    ['max', 'red'],
    ['unknown', 'cyan'],
  ])('colours effort %s as %s', async (effort, color) => {
    const s = await withStep({}, { model: 'claude-x', effort })
    expect(parts(await render(s))[0]).toEqual({ text: `x · ${effort}`, color })
  })
})

describe('context part', () => {
  it.each([
    [0, 'green'],
    [59, 'green'],
    [60, 'yellow'],
    [84, 'yellow'],
    [85, 'red'],
    [100, 'red'],
  ])('shows %i percent in %s', async (percent, color) => {
    const s = setup({ usage: { context: { percent } } })
    expect(parts(await render(s))).toEqual([{ text: `ctx ${percent}%`, color }])
  })

  it('is omitted when the percentage is unknown', async () => {
    const s = setup({ usage: { context: {}, cost: { usd: 1 } } })
    expect(parts(await render(s)).map(p => p.text)).toEqual(['$1.00'])
  })
})

describe('cache part', () => {
  const T0 = 1_000_000
  const at = async (elapsedMs: number) => {
    const s = setup({ clock: T0 })
    await runStep(s.handlers['turn.step']!, s.$, { model: 'claude-x' })
    s.env.clock = T0 + elapsedMs
    return cachePart(s)
  }

  it('is hidden before any response', async () => {
    expect(await cachePart(setup({ clock: T0 }))).toBeUndefined()
  })

  it.each([
    [0, 'cache 5:00', 'green'],
    [120_000, 'cache 3:00', 'green'],
    [150_000, 'cache 2:30', 'yellow'],
    [239_000, 'cache 1:01', 'yellow'],
    [240_000, 'cache 1:00', 'red'],
    [299_000, 'cache 0:01', 'red'],
  ])('after %i ms shows %s in %s', async (elapsed, text, color) => {
    expect(await at(elapsed)).toEqual({ text, color })
  })

  it('goes cold once the TTL has passed', async () => {
    expect(await at(300_000)).toEqual({ text: 'cache cold', color: 'red' })
    expect(await at(900_000)).toEqual({ text: 'cache cold', color: 'red' })
  })

  it('uses the later of the redraw tick and the clock', async () => {
    const s = setup({ clock: T0 })
    await runStep(s.handlers['turn.step']!, s.$, { model: 'claude-x' })
    await s.handlers['session.start']!(s.$, {}, passthrough)
    // the tick records the real Date.now(), far later than T0
    await s.ticks[0]!.fn()
    expect((await cachePart(s))!.text).toBe('cache cold')
  })
})

describe('cost part', () => {
  it.each([
    [0, '$0.00', 'green'],
    [2.99, '$2.99', 'green'],
    [3, '$3.00', 'yellow'],
    [9.99, '$9.99', 'yellow'],
    [10, '$10.00', 'red'],
  ])('shows %f as %s in %s', async (usd, text, color) => {
    const s = setup({ usage: { context: {}, cost: { usd } } })
    expect(parts(await render(s))).toEqual([{ text, color }])
  })
})

describe('layout', () => {
  it('defers to the next handler while a survey is shown', async () => {
    const s = await withStep({ usage: { context: { percent: 10 } } })
    expect(await render(s, { hasSurvey: true })).toBe('passthrough')
  })

  it('defers when there is nothing to show', async () => {
    expect(await render(setup())).toBe('passthrough')
  })

  it('separates parts with dividers', async () => {
    const s = await withStep({ usage: { context: { percent: 10 }, cost: { usd: 1 } }, clock: 5 })
    const view = await render(s)
    expect(parts(view)).toHaveLength(4)
    expect(separators(view)).toBe(3)
  })
})
