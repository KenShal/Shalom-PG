// Supabase Edge Function: runs once a day (pg_cron) and sends rent reminders
// automatically — email via Resend, WhatsApp via the Meta WhatsApp Cloud API.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY, REMINDER_FROM_EMAIL           e.g. "Nivas <rent@yourdomain.com>"
//   WA_TOKEN, WA_PHONE_NUMBER_ID, WA_TEMPLATE      WhatsApp Cloud API (template must be approved by Meta)
import { createClient } from 'jsr:@supabase/supabase-js@2'

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
const inr = (n: number) => '₹' + n.toLocaleString('en-IN')
const pad = (n: number) => String(n).padStart(2, '0')

function istToday() {
  const d = new Date(Date.now() + 5.5 * 3600e3)
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}
function dueDate(dueDay: number, y: number, m: number) {
  const dim = new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
  return new Date(Date.UTC(y, m, Math.min(dueDay, dim)))
}

async function sendEmail(to: string, subject: string, text: string) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: Deno.env.get('REMINDER_FROM_EMAIL'), to, subject, text }),
  })
  return r.ok
}

async function sendWhatsApp(phone: string, params: string[]) {
  let to = phone.replace(/\D/g, '')
  if (to.length === 10) to = '91' + to
  const r = await fetch(`https://graph.facebook.com/v21.0/${Deno.env.get('WA_PHONE_NUMBER_ID')}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('WA_TOKEN')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      // Template body, e.g.: "Hi {{1}}, your rent of {{2}} for {{3}} at {{4}} is {{5}}. Pay via UPI: {{6}}"
      template: {
        name: Deno.env.get('WA_TEMPLATE') ?? 'rent_reminder',
        language: { code: 'en' },
        components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
      },
    }),
  })
  return r.ok
}

Deno.serve(async () => {
  const today = istToday()
  const y = today.getUTCFullYear(), m = today.getUTCMonth()
  const period = `${y}-${pad(m + 1)}`
  const { data: tenants } = await sb
    .from('tenants')
    .select('*, owners(*), houses(name)')
    .eq('status', 'approved')
    .eq('active', true)
  const { data: paid } = await sb.from('payments').select('tenant_id').eq('period', period)
  const paidSet = new Set((paid ?? []).map((p) => p.tenant_id))
  let sent = 0

  for (const t of tenants ?? []) {
    if (paidSet.has(t.id)) continue
    const due = dueDate(t.due_day, y, m)
    const days = Math.round((due.getTime() - today.getTime()) / 864e5)
    const owner = t.owners
    // Remind N days before, on the day, then every 3 days while overdue.
    const shouldSend = days === owner.remind_days || days === 0 || (days < 0 && -days % 3 === 0)
    if (!shouldSend) continue

    const month = due.toLocaleString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    const when = days === 0 ? 'due today' : days > 0 ? `due on ${due.getUTCDate()} ${month}` : `overdue by ${-days} days`
    const pay = owner.pay_link || owner.upi_id || ''
    const text = `Hi ${t.name.split(' ')[0]},\n\nA gentle reminder from ${t.houses.name}: your rent of ${inr(t.rent)} for ${month} is ${when}.\n\n${pay ? 'Pay: ' + pay + '\n\n' : ''}Thank you!\n— ${owner.name}`

    const results: [string, boolean][] = []
    if ((t.channel === 'email' || t.channel === 'both') && t.email)
      results.push(['email', await sendEmail(t.email, `Rent reminder — ${t.houses.name} · ${month}`, text)])
    if (t.channel === 'whatsapp' || t.channel === 'both')
      results.push(['whatsapp', await sendWhatsApp(t.phone, [t.name.split(' ')[0], inr(t.rent), month, t.houses.name, when, pay || '—'])])

    for (const [channel, ok] of results) {
      await sb.from('reminders').insert({ tenant_id: t.id, owner_id: t.owner_id, period, channel, auto: true, status: ok ? 'sent' : 'failed' })
      if (ok) sent++
    }
  }
  return new Response(JSON.stringify({ ok: true, sent }), { headers: { 'Content-Type': 'application/json' } })
})
