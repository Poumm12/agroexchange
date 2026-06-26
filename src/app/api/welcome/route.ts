/**
 * POST /api/welcome
 * Sends a welcome email after successful registration.
 * Called fire-and-forget from AuthContext.signUp().
 *
 * Email providers supported (in priority order):
 *   1. Resend (resend.com) — set RESEND_API_KEY in .env
 *   2. Supabase SMTP relay  — works if SMTP is configured in Supabase Dashboard
 *   3. Console log fallback — for local dev without keys
 */
import { NextResponse } from 'next/server'

const RESEND_KEY = process.env.RESEND_API_KEY

// ── Welcome Email HTML ─────────────────────────────────────────
function buildWelcomeEmail(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Καλώς ήρθατε στο AgroExchange</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F7F0;font-family:Inter,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F7F0;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#2E7D32;padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;font-family:Georgia,serif;">
                AGRO<span style="color:#A5D6A7;">EXCHANGE</span>
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                Η ψηφιακή αγορά αγροτικών προϊόντων
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 16px;color:#111816;font-size:22px;font-weight:700;font-family:Georgia,serif;">
                Καλώς ήρθες, ${firstName}!
              </h2>
              <p style="margin:0 0 16px;color:#4B5563;font-size:15px;line-height:1.7;">
                Χαιρόμαστε που είσαι μαζί μας. Ο λογαριασμός σου στο <strong>AgroExchange</strong>
                είναι ήδη ενεργός και μπορείς να ξεκινήσεις αμέσως.
              </p>
              <p style="margin:0 0 28px;color:#4B5563;font-size:15px;line-height:1.7;">
                Το AgroExchange είναι η ψηφιακή πλατφόρμα που συνδέει
                <strong>παραγωγούς</strong>, <strong>αγοραστές</strong> και <strong>μεταφορείς</strong>
                αγροτικών προϊόντων σε όλη την Ελλάδα.
              </p>

              <!-- Feature boxes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:0 0 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#F0F7F0;border-radius:12px;border:1px solid #C8E6C9;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:20px;padding-right:12px;vertical-align:top;">📋</td>
                              <td>
                                <div style="color:#1B5E20;font-weight:700;font-size:14px;margin-bottom:4px;">Αγγελίες Προϊόντων</div>
                                <div style="color:#4B5563;font-size:13px;line-height:1.5;">Δημιούργησε ή βρες αγγελίες για σιτάρι, ελαιόλαδο, βαμβάκι και δεκάδες άλλα προϊόντα.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#F0F7F0;border-radius:12px;border:1px solid #C8E6C9;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:20px;padding-right:12px;vertical-align:top;">📈</td>
                              <td>
                                <div style="color:#1B5E20;font-weight:700;font-size:14px;margin-bottom:4px;">Τιμές Αγοράς σε Πραγματικό Χρόνο</div>
                                <div style="color:#4B5563;font-size:13px;line-height:1.5;">Παρακολούθησε live τιμές για σιτηρά, ελαιόλαδο, βαμβάκι και άλλα αγροτικά προϊόντα.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 12px;">
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#F0F7F0;border-radius:12px;border:1px solid #C8E6C9;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:20px;padding-right:12px;vertical-align:top;">🚛</td>
                              <td>
                                <div style="color:#1B5E20;font-weight:700;font-size:14px;margin-bottom:4px;">Υπηρεσίες Μεταφοράς</div>
                                <div style="color:#4B5563;font-size:13px;line-height:1.5;">Βρες αξιολογημένους μεταφορείς για τη μεταφορά των προϊόντων σου σε όλη την Ελλάδα.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="background:#F0F7F0;border-radius:12px;border:1px solid #C8E6C9;">
                      <tr>
                        <td style="padding:16px 20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size:20px;padding-right:12px;vertical-align:top;">📰</td>
                              <td>
                                <div style="color:#1B5E20;font-weight:700;font-size:14px;margin-bottom:4px;">Αγροτικά Νέα & Επιδοτήσεις</div>
                                <div style="color:#4B5563;font-size:13px;line-height:1.5;">Ενημέρωσε τον εαυτό σου για νέα προγράμματα ΕΣΠΑ, νομοθεσία και εξελίξεις στην αγορά.</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agroexchange.gr'}"
                      style="display:inline-block;background:#2E7D32;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:15px;">
                      Εξερεύνησε την Πλατφόρμα →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6B7280;font-size:13px;line-height:1.6;">
                Σου προτείνουμε να ξεκινήσεις ολοκληρώνοντας το
                <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://agroexchange.gr'}"
                  style="color:#2E7D32;font-weight:600;">προφίλ σου</a>
                για να αυξήσεις το Trust Score σου και να προσελκύσεις περισσότερες συναλλαγές.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F9FAF9;padding:24px 40px;border-top:1px solid #E5E7EB;text-align:center;">
              <p style="margin:0 0 8px;color:#9CA3AF;font-size:12px;">
                © ${new Date().getFullYear()} AgroExchange · Αθήνα, Ελλάδα
              </p>
              <p style="margin:0;color:#9CA3AF;font-size:11px;">
                Αυτό το email στάλθηκε γιατί δημιουργήσατε λογαριασμό στο AgroExchange.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Route Handler ──────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const { email, full_name } = await req.json()
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const firstName = (full_name ?? '').split(' ')[0] || 'χρήστη'
    const html      = buildWelcomeEmail(firstName)

    // ── Option 1: Resend (resend.com) ─────────────────────────
    if (RESEND_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          from:    'AgroExchange Team <noreply@agroexchange.gr>',
          to:      [email],
          subject: 'Καλώς ήρθατε στο AgroExchange',
          html,
        }),
      })
      if (!res.ok) {
        const err = await res.text()
        console.error('[welcome] Resend error:', err)
        return NextResponse.json({ sent: false, provider: 'resend', error: err }, { status: 200 })
      }
      return NextResponse.json({ sent: true, provider: 'resend' })
    }

    // ── Option 2: No provider configured — log for dev ────────
    console.log(`[welcome] Would send to: ${email} (${firstName}) — add RESEND_API_KEY to enable`)
    return NextResponse.json({ sent: false, provider: 'none', note: 'Add RESEND_API_KEY to send emails' })

  } catch (e: any) {
    console.error('[welcome] Error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
