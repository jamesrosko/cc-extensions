export type Info = { model: string; effort: string; lastResponseAt: number }

declare module 'claude-code' {
  interface PluginState {
    'status-bar': { info: Info; now: number }
  }
}
