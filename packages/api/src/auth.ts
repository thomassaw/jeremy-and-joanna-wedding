const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs'

interface JwtHeader {
  kid: string
  alg: string
}

interface GooglePayload {
  iss: string
  aud: string
  email: string
  email_verified: boolean
  exp: number
}

let cachedKeys: { keys: Array<{ kid: string; n: string; e: string }> } | null = null
let cachedAt = 0

async function getGooglePublicKeys() {
  if (cachedKeys && Date.now() - cachedAt < 3600_000) return cachedKeys
  const res = await fetch(GOOGLE_CERTS_URL)
  cachedKeys = (await res.json()) as typeof cachedKeys
  cachedAt = Date.now()
  return cachedKeys!
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function base64UrlToJson(str: string): unknown {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(str)))
}

async function importKey(jwk: { n: string; e: string }): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    { kty: 'RSA', n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify'],
  )
}

async function verifyToken(token: string, clientId: string): Promise<GooglePayload> {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid token format')
  const [headerB64, payloadB64, signatureB64] = parts as [string, string, string]

  const header = base64UrlToJson(headerB64) as JwtHeader
  const payload = base64UrlToJson(payloadB64) as GooglePayload

  // Verify claims
  if (!['https://accounts.google.com', 'accounts.google.com'].includes(payload.iss)) {
    throw new Error('Invalid issuer')
  }
  if (payload.aud !== clientId) throw new Error('Invalid audience')
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired')

  // Verify signature
  const keys = await getGooglePublicKeys()
  const keyData = keys.keys.find((k) => k.kid === header.kid)
  if (!keyData) throw new Error('Key not found')

  const key = await importKey(keyData)
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  const signature = base64UrlDecode(signatureB64)

  const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature.buffer as ArrayBuffer, data)
  if (!valid) throw new Error('Invalid signature')

  return payload
}

export async function verifyAdmin(authHeader: string | undefined): Promise<string> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing authorization token')
  }

  const token = authHeader.slice(7)
  const clientId = process.env['GOOGLE_CLIENT_ID']
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured')

  const payload = await verifyToken(token, clientId)
  if (!payload.email) throw new Error('No email in token')

  const allowedEmails = (process.env['ADMIN_EMAILS'] ?? '').split(',').map((e) => e.trim().toLowerCase())
  if (!allowedEmails.includes(payload.email.toLowerCase())) {
    throw new Error('Unauthorized email')
  }

  return payload.email
}
