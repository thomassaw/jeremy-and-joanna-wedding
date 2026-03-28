import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb'
import { verifyAdmin } from './auth.js'
import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env['TABLE_NAME'] ?? ''

function response(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function generateId(): string {
  const t = Date.now().toString(36)
  const r = Math.random().toString(36).slice(2, 8)
  return `${t}-${r}`
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  const route = event.routeKey

  try {
    switch (route) {
      case 'POST /rsvp':
        return await postRsvp(event)
      case 'GET /rsvp':
        return await listRsvps(event)
      case 'DELETE /rsvp/{id}':
        return await deleteRsvp(event)
      case 'GET /wishes':
        return await listWishes()
      case 'GET /stats':
        return await getStats()
      case 'GET /settings':
        return await getSettings()
      case 'PUT /settings':
        return await putSettings(event)
      default:
        return response(404, { error: 'Not found' })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error'
    const status = message.includes('Unauthorized') || message.includes('Missing auth') ? 401 : 500
    return response(status, { error: message })
  }
}

async function postRsvp(event: APIGatewayProxyEventV2) {
  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>
  const name = String(body['name'] ?? '').trim()
  const email = String(body['email'] ?? '').trim()
  const attendance = String(body['attendance'] ?? '')
  const guests = Number(body['guests'] ?? 1)
  const wishes = String(body['wishes'] ?? '').trim()

  if (!name || !['yes', 'no'].includes(attendance)) {
    return response(400, { error: 'Name and attendance (yes/no) are required' })
  }

  const id = generateId()
  const createdAt = new Date().toISOString()

  const rsvpItem = {
    pk: 'RSVP',
    sk: `RSVP#${id}`,
    id,
    name,
    email,
    attendance,
    guests,
    wishes,
    createdAt,
  }

  if (wishes) {
    await ddb.send(new TransactWriteCommand({
      TransactItems: [
        { Put: { TableName: TABLE, Item: rsvpItem } },
        {
          Put: {
            TableName: TABLE,
            Item: {
              pk: 'WISH',
              sk: `WISH#${createdAt}#${id}`,
              name,
              text: wishes,
              createdAt,
            },
          },
        },
      ],
    }))
  } else {
    await ddb.send(new PutCommand({ TableName: TABLE, Item: rsvpItem }))
  }

  return response(201, { id, message: 'RSVP submitted' })
}

async function listRsvps(event: APIGatewayProxyEventV2) {
  await verifyAdmin(event.headers['authorization'])

  const result = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': 'RSVP' },
    ScanIndexForward: false,
  }))

  return response(200, result.Items ?? [])
}

async function deleteRsvp(event: APIGatewayProxyEventV2) {
  await verifyAdmin(event.headers['authorization'])

  const id = event.pathParameters?.['id']
  if (!id) return response(400, { error: 'Missing id' })

  // Find associated wish items (sk contains the rsvp id)
  const wishes = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    FilterExpression: 'contains(sk, :id)',
    ExpressionAttributeValues: { ':pk': 'WISH', ':id': id },
  }))

  const deleteOps: Array<{ Delete: { TableName: string; Key: Record<string, string> } }> = [
    { Delete: { TableName: TABLE, Key: { pk: 'RSVP', sk: `RSVP#${id}` } } },
  ]

  for (const wish of wishes.Items ?? []) {
    deleteOps.push({ Delete: { TableName: TABLE, Key: { pk: 'WISH', sk: wish['sk'] as string } } })
  }

  await ddb.send(new TransactWriteCommand({ TransactItems: deleteOps }))

  return response(200, { message: 'Deleted' })
}

async function listWishes() {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': 'WISH' },
    ScanIndexForward: false,
  }))

  return response(200, result.Items ?? [])
}

async function getStats() {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE,
    KeyConditionExpression: 'pk = :pk',
    ExpressionAttributeValues: { ':pk': 'RSVP' },
  }))

  const rsvps = result.Items ?? []
  const attending = rsvps.filter((r) => r['attendance'] === 'yes')
  const declined = rsvps.filter((r) => r['attendance'] === 'no')
  const totalGuests = attending.reduce((sum, r) => sum + (Number(r['guests']) || 1), 0)

  return response(200, {
    attending: attending.length,
    declined: declined.length,
    totalGuests,
    total: rsvps.length,
  })
}

const DEFAULT_SETTINGS = {
  groomName: 'Jeremy Chee',
  brideName: 'Joanna Tong',
  weddingDate: '2026-09-20T11:00:00+08:00',
  events: [
    {
      title: 'Holy Matrimony',
      time: '11:00 AM',
      date: 'Sunday, 20 September 2026',
      venue: 'M Resort & Hotel\nKuala Lumpur',
    },
    {
      title: 'Wedding Reception',
      time: '7:00 PM',
      date: 'Sunday, 20 September 2026',
      venue: 'M Resort & Hotel\nKuala Lumpur',
    },
  ],
  venue: {
    name: 'M Resort & Hotel Kuala Lumpur',
    address: 'Al-Messra Sdn Bhd, Jalan Damai, Off Jalan Ampang, 55000 Kuala Lumpur, Malaysia',
    googleMapsUrl: 'https://maps.google.com/?q=M+Resort+%26+Hotel+Kuala+Lumpur',
    wazeUrl: 'https://www.waze.com/ul?q=M+Resort+%26+Hotel+Kuala+Lumpur',
    embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.786!2d101.7372!3d3.1590!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc37d3a42e95e1%3A0x1e3f2e5f36e0a40!2sM+Resort+%26+Hotel+Kuala+Lumpur!5e0!3m2!1sen!2smy!4v1',
  },
  contacts: [
    { name: 'Joanna', phone: '+60123456789', role: 'Bride' },
    { name: 'Jeremy', phone: '+60123456789', role: 'Groom' },
  ],
}

async function getSettings() {
  const result = await ddb.send(new GetCommand({
    TableName: TABLE,
    Key: { pk: 'SETTINGS', sk: 'SETTINGS' },
  }))

  if (!result.Item) {
    return response(200, DEFAULT_SETTINGS)
  }

  const { pk, sk, ...settings } = result.Item
  return response(200, settings)
}

async function putSettings(event: APIGatewayProxyEventV2) {
  await verifyAdmin(event.headers['authorization'])

  const body = JSON.parse(event.body ?? '{}') as Record<string, unknown>

  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      pk: 'SETTINGS',
      sk: 'SETTINGS',
      ...body,
      updatedAt: new Date().toISOString(),
    },
  }))

  return response(200, { message: 'Settings saved' })
}
