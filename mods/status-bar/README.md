# status-bar

A mod that draws a dim band above the prompt:

`opus-5-5 · high  │  ctx 42%  │  cache 3:12  │  $1.37`

- **model · effort**: from the latest model request.
- **ctx**: context window used (`$.session.usage()`).
- **cache**: countdown to the prompt cache expiring, reset after each response. Assumes the 5-minute TTL (`CACHE_TTL_MS` in `hooks/register.tsx`); change it if you use the 1-hour cache.
- **$**: session cost so far.

## Try it

`claude --plugin-dir mods/status-bar`
