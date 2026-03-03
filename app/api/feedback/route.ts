import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function POST(request: Request) {
  const { email, message } = await request.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 })
  }
  try {
    const db = await getDb()
    await db.collection('feedback').insertOne({ email, message, created_at: new Date() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
