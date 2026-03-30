import { NextResponse } from 'next/server'

export async function GET() {
  const connected = !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  )
  return NextResponse.json({ connected })
}
