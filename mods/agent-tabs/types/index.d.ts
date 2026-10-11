export type Tab = {
  id: string
  name: string
  status: string
}

declare module 'claude-code' {
  interface PluginState {
    'agent-tabs': {
      tabs: Tab[]
      models: Record<string, string>
      selected: string
    }
  }
}
