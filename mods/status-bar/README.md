# status-bar

A mod that draws a dim band above the prompt:

`opus-5-5 · high  │  ctx 42%  │  cache 3:12  │  $1.37`

- **model · effort**: from the latest model request.
- **ctx**: context window used (`$.session.usage()`).
- **cache**: countdown to the prompt cache expiring, reset after each response. Assumes the 5-minute TTL (`CACHE_TTL_MS` in `hooks/register.tsx`); change it if you use the 1-hour cache.
- **$**: session cost so far.

Each field is colored by its state:

| Field | Green | Yellow | Red |
| --- | --- | --- | --- |
| model · effort | low | high | max (medium cyan, xhigh magenta) |
| ctx | < 60% | 60–84% | ≥ 85% |
| cache | > 50% of TTL left | 20–50% left | < 20% left, or cold |
| $ | < $3 | $3–$10 | ≥ $10 |

Thresholds live in the `ui.render` hook in `hooks/register.tsx`.

## Install

```
/plugin marketplace add jamesrosko/cc-extensions
/plugin install status-bar@cc-extensions
```

Or install in one step: `/plugin install status-bar --marketplace jamesrosko/cc-extensions`

## Try it

`claude --plugin-dir mods/status-bar`
