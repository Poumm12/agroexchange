/**
 * POST /api/assistant
 * AgroExchange AI assistant — answers platform questions in Greek.
 *
 * Uses the in-artifact Anthropic API if available (no key needed in that
 * environment); otherwise falls back to a deterministic rule-based helper
 * so the assistant always works, even offline. The client handles the
 * admin-handoff flow when the assistant cannot resolve an issue.
 */
import { NextResponse } from 'next/server'

interface ChatTurn { role: 'user' | 'assistant'; content: string }

const SYSTEM_PROMPT = `Είσαι ο βοηθός του AgroExchange, μιας ελληνικής ψηφιακής αγοράς αγροτικών προϊόντων.
Βοηθάς χρήστες με: αγγελίες προϊόντων, τιμές αγοράς, μεταφορές, ζητήσεις διαδρομής, ασφάλειες (σύντομα), προφίλ και μηνύματα.
Απαντάς ΠΑΝΤΑ στα ελληνικά, σύντομα, ευγενικά και πρακτικά. Αν δεν μπορείς να βοηθήσεις ή το θέμα χρειάζεται ανθρώπινη υποστήριξη, πρότεινε στον χρήστη να επικοινωνήσει με την ομάδα υποστήριξης.`

// Rule-based fallback — keeps the assistant useful without any API key.
function ruleBasedReply(message: string): { reply: string; canHelp: boolean } {
  const m = message.toLowerCase()
  if (/(αγγελ|πουλ|πώλη|δημοσ)/.test(m))
    return { reply: 'Για να δημιουργήσεις αγγελία: πήγαινε στην καρτέλα «Αγγελίες» → «Νέα Αγγελία», συμπλήρωσε τίτλο, κατηγορία, τιμή ανά μονάδα, ποσότητα και τοποθεσία. Η αγγελία δημοσιεύεται αμέσως.', canHelp: true }
  if (/(μεταφορ|φορτηγ|διαδρομ|αποστολ)/.test(m))
    return { reply: 'Στην καρτέλα «Μεταφορές» μπορείς να βρεις μεταφορείς ανά διαδρομή. Αν δεν υπάρχει διαθέσιμη διαδρομή, πάτησε «Ζήτηση Διαδρομής» για να ειδοποιηθούν οι μεταφορικές εταιρείες.', canHelp: true }
  if (/(τιμ|αγορά|σιτάρ|καλαμπ|βαμβ|ελαι)/.test(m))
    return { reply: 'Οι τρέχουσες τιμές αγοράς εμφανίζονται στην καρτέλα «Αγορά» και στην αρχική σελίδα. Ενημερώνονται live για σιτάρι, καλαμπόκι, βαμβάκι, ελαιόλαδο και άλλα.', canHelp: true }
  if (/(αγοραστ|πουλήσ|βρω αγορ|πελάτ)/.test(m))
    return { reply: 'Για να βρεις αγοραστές: δημοσίευσε ποιοτικές αγγελίες με σαφή τιμή και τοποθεσία, διατήρησε υψηλό Trust Score και απάντα γρήγορα στις προσφορές και τα μηνύματα.', canHelp: true }
  if (/(πώς λειτουργ|τι είναι|βοήθεια|help)/.test(m))
    return { reply: 'Το AgroExchange συνδέει παραγωγούς, αγοραστές και μεταφορείς. Δημοσιεύεις αγγελίες, λαμβάνεις προσφορές, επικοινωνείς με μηνύματα και κανονίζεις μεταφορά — όλα σε ένα μέρος.', canHelp: true }
  if (/(ασφάλ|insurance)/.test(m))
    return { reply: 'Οι ασφαλιστικές υπηρεσίες έρχονται σύντομα στο AgroExchange. Θα μπορείς να συγκρίνεις και να αγοράζεις ασφάλειες καλλιεργειών, μεταφορών και συναλλαγών.', canHelp: true }
  return { reply: 'Δεν είμαι σίγουρος ότι μπορώ να το λύσω αυτό. Θέλεις να σε συνδέσω με την ομάδα υποστήριξης;', canHelp: false }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json() as { messages: ChatTurn[] }
    const lastUser = [...(messages ?? [])].reverse().find(m => m.role === 'user')?.content ?? ''

    // Try the in-environment Anthropic API (available inside artifacts/runtime)
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: (messages ?? []).map(m => ({ role: m.role, content: m.content })),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = (data.content ?? [])
          .map((b: any) => (b.type === 'text' ? b.text : ''))
          .filter(Boolean).join('\n').trim()
        if (text) {
          const lower = text.toLowerCase()
          const canHelp = !/(υποστήριξ|δεν μπορώ|επικοινων)/.test(lower)
          return NextResponse.json({ reply: text, canHelp, provider: 'anthropic' })
        }
      }
    } catch { /* fall through to rule-based */ }

    const fallback = ruleBasedReply(lastUser)
    return NextResponse.json({ ...fallback, provider: 'rules' })
  } catch (e: any) {
    return NextResponse.json({ reply: 'Παρουσιάστηκε σφάλμα. Δοκίμασε ξανά.', canHelp: false, error: e.message }, { status: 200 })
  }
}
