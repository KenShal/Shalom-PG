import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Sparkles, Bell, CheckCircle2, MessageCircle } from 'lucide-react'
import { signIn, signUp, seedDemo, cloud } from '../store'
import { Field, ease, useToast } from '../ui'

export const APP_NAME = 'Shalom PG'

export function Logo({ small }) {
  return (
    <div className={'logo' + (small ? ' small' : '')}>
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 15.5 16 5l12 10.5V27a1 1 0 0 1-1 1h-7v-7.5h-8V28H5a1 1 0 0 1-1-1z" fill="currentColor" />
        <circle cx="23.5" cy="9" r="3.4" fill="var(--accent-2)" stroke="var(--bg)" strokeWidth="1.6" />
      </svg>
      <span>{APP_NAME}</span>
    </div>
  )
}

const floats = [
  { icon: Bell, tone: 'warn', title: 'Ananya’s rent is due today', sub: 'Lotus House · Room 101 · ₹9,500' },
  { icon: MessageCircle, tone: 'ok', title: 'Reminder sent on WhatsApp', sub: 'Rohit Menon · 2 min ago' },
  { icon: CheckCircle2, tone: 'ok', title: '₹11,000 received', sub: 'Priya Shah · November rent' },
]

function Hero() {
  return (
    <div className="auth-hero">
      <Logo />
      <div className="auth-hero-copy">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
          Every room. Every rent.
          <em> No chasing.</em>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease }}>
          Your houses, residents and their documents in one calm place, with rent reminders you send in one tap.
        </motion.p>
      </div>
      <div className="auth-floats" aria-hidden="true">
        {floats.map((f, i) => (
          <motion.div
            key={i}
            className="float-card"
            initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }}
            animate={{ opacity: 1, y: [0, -6, 0], rotate: i % 2 ? 1.5 : -1.5 }}
            transition={{ opacity: { delay: 0.35 + i * 0.15, duration: 0.6 }, y: { delay: 0.35 + i * 0.15, duration: 5 + i, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ marginLeft: [0, 48, 16][i] }}
          >
            <span className={'float-ic ' + f.tone}>
              <f.icon size={16} />
            </span>
            <div>
              <strong>{f.title}</strong>
              <small>{f.sub}</small>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function Auth() {
  // In the cloud, owner accounts are added from the Supabase dashboard (see README), so only sign-in is shown.
  const [mode, setMode] = useState('in')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const toast = useToast()

  const run = (fn) => async (e) => {
    e.preventDefault()
    setErr('')
    setBusy(true)
    try {
      await fn(Object.fromEntries(new FormData(e.currentTarget)))
    } catch (x) {
      setErr(x.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <Hero />
      <div className="auth-panel">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease }}>
              <h2>{mode === 'in' ? 'Welcome back' : 'Set up your PG'}</h2>
              <p className="muted">{mode === 'in' ? 'Sign in to see today’s rents.' : 'Each owner gets their own private account.'}</p>
              <form onSubmit={run(mode === 'in' ? signIn : signUp)} className="stack">
                {mode === 'up' && <Field label="Your name" name="name" required placeholder="e.g. Sunita Sharma" autoComplete="name" />}
                <Field label="Email" name="email" type="email" required placeholder="you@gmail.com" autoComplete="email" />
                <Field label="Password" name="password" type="password" required minLength={6} placeholder="At least 6 characters" autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />
                {err && <p className="form-err">{err}</p>}
                <button className="btn primary lg" disabled={busy}>
                  {busy ? 'Please wait…' : mode === 'in' ? 'Sign in' : 'Create account'} <ArrowRight size={18} />
                </button>
              </form>
              {cloud ? (
                <p className="switch">Forgot your password or need an account? Ask the family admin.</p>
              ) : (
                <p className="switch">
                  {mode === 'in' ? 'New here?' : 'Already have an account?'}{' '}
                  <button className="link" onClick={() => { setMode(mode === 'in' ? 'up' : 'in'); setErr('') }}>
                    {mode === 'in' ? 'Create an account' : 'Sign in'}
                  </button>
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {!cloud && <div className="divider"><span>or</span></div>}
          {!cloud && (
            <button
              className="btn ghost"
              onClick={async () => {
                await seedDemo()
                toast('Loaded a demo PG with sample residents')
              }}
            >
              <Sparkles size={16} /> Explore with demo data
            </button>
          )}
        </motion.div>
      </div>
    </div>
  )
}
