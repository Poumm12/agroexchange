/**
 * POST /api/support
 * Creates a support ticket (AI → admin handoff or contact form).
 * Uses the service-role admin client so tickets can be created even
 * for anonymous visitors. Admin reviews them later in the support dashboard.
 */
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { validateText, sanitizeInput } from '@/lib/moderation'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, message, user_id, ai_transcript, source } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'name, email και message είναι υποχρεωτικά' }, { status: 400 })
    }

    // Server-side moderation (defense-in-depth; client also validates)
    const nameCheck = validateText(name, { required: true, maxLength: 120 })
    if (!nameCheck.ok) return NextResponse.json({ error: nameCheck.error }, { status: 400 })
    const msgCheck = validateText(message, { required: true, maxLength: 2000 })
    if (!msgCheck.ok) return NextResponse.json({ error: msgCheck.error }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('support_tickets')
      .insert({
        name: sanitizeInput(name),
        email: email.trim(),
        phone: sanitizeInput(phone ?? ''),
        message: sanitizeInput(message),
        user_id: user_id ?? null,
        source: source ?? 'ai_assistant',
        ai_transcript: ai_transcript ?? null,
        status: 'open',
      })
      .select('id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, id: data.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
