import { h, Fragment } from './claude-code.stub'

// The engine resolves JSX against global `h` / `Fragment`.
Object.assign(globalThis, { h, Fragment })
