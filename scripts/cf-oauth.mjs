/**
 * Headless Cloudflare OAuth (PKCE) helper for remote/agent environments.
 *
 * Wrangler's built-in `wrangler login` runs a localhost callback server that
 * times out after ~2 minutes — unusable when the approving human is on a
 * different machine with asynchronous turnaround. This helper runs the same
 * OAuth flow (same client id, scopes and redirect URI) but with no listener:
 *
 *   node scripts/cf-oauth.mjs start
 *     → prints the authorization URL; PKCE verifier is saved to /tmp.
 *
 *   node scripts/cf-oauth.mjs finish "<pasted callback URL>"
 *     → exchanges the code and writes wrangler's credential file.
 */
import crypto from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'

const CLIENT_ID = '54d11594-84e4-41aa-b438-e81b8fa78ee7'
const REDIRECT_URI = 'http://localhost:8976/oauth/callback'
const AUTH_URL = 'https://dash.cloudflare.com/oauth2/auth'
const TOKEN_URL = 'https://dash.cloudflare.com/oauth2/token'
const STATE_FILE = '/tmp/cf-oauth-state.json'
const CONFIG_DIR = path.join(homedir(), '.config', '.wrangler', 'config')

const SCOPES = [
  'account:read', 'user:read', 'workers:write', 'workers_kv:write',
  'workers_routes:write', 'workers_scripts:write', 'workers_tail:read',
  'd1:write', 'pages:write', 'zone:read', 'ssl_certs:write', 'ai:write',
  'ai-search:write', 'ai-search:run', 'websearch.run', 'agent-memory:write',
  'queues:write', 'pipelines:write', 'secrets_store:write', 'artifacts:write',
  'flagship:write', 'containers:write', 'cloudchamber:write',
  'connectivity:admin', 'email_routing:write', 'email_sending:write',
  'browser:write', 'challenge-widgets.write', 'offline_access',
]

const b64url = (buf) => buf.toString('base64url')

async function start() {
  const verifier = b64url(crypto.randomBytes(48))
  const state = b64url(crypto.randomBytes(24))
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
  await writeFile(STATE_FILE, JSON.stringify({ verifier, state }))
  const url = new URL(AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', REDIRECT_URI)
  url.searchParams.set('scope', SCOPES.join(' '))
  url.searchParams.set('state', state)
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('code_challenge_method', 'S256')
  console.log(url.toString())
}

async function finish(callbackUrl) {
  const { verifier, state } = JSON.parse(await readFile(STATE_FILE, 'utf8'))
  const parsed = new URL(callbackUrl)
  const code = parsed.searchParams.get('code')
  const gotState = parsed.searchParams.get('state')
  if (!code) throw new Error('No ?code= found in the pasted URL')
  if (gotState !== state) throw new Error('State mismatch — run `start` again and use the fresh URL')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: verifier,
    }),
  })
  const body = await res.text()
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${body}`)
  const json = JSON.parse(body)

  const expiry = new Date(Date.now() + (json.expires_in ?? 3600) * 1000).toISOString()
  const scopes = (json.scope ?? SCOPES.join(' ')).split(' ')
  const toml = [
    `oauth_token = "${json.access_token}"`,
    `expiration_time = "${expiry}"`,
    ...(json.refresh_token ? [`refresh_token = "${json.refresh_token}"`] : []),
    `scopes = [ ${scopes.map((s) => `"${s}"`).join(', ')} ]`,
    '',
  ].join('\n')

  await mkdir(CONFIG_DIR, { recursive: true })
  await writeFile(path.join(CONFIG_DIR, 'default.toml'), toml, { mode: 0o600 })
  console.log('Credentials written. Verify with: npx wrangler whoami')
}

const [cmd, arg] = process.argv.slice(2)
if (cmd === 'start') await start()
else if (cmd === 'finish' && arg) await finish(arg)
else {
  console.error('Usage: cf-oauth.mjs start | cf-oauth.mjs finish "<callback url>"')
  process.exit(1)
}
