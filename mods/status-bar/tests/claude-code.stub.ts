// Minimal stand-in for the runtime-provided `claude-code` module.
// State lives on the fake `$` (see harness.ts) so each test starts clean.
type Atom<T> = { key: object; init: T }

export const atom = <T>(key: object, init: T): Atom<T> => ({ key, init })

export const read = async <T>($: any, a: Atom<T>): Promise<T> => ($.store.has(a) ? $.store.get(a) : a.init)

export const update = async <T>($: any, a: Atom<T>, fn: (v: T) => T): Promise<void> => {
  $.store.set(a, fn(await read($, a)))
}

export const h = (type: unknown, props: object | null, ...children: unknown[]) => ({
  type,
  props: props ?? {},
  children: children.flat(),
})

export const Fragment = 'Fragment'
