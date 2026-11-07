import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDB, useSession, useReady, onSyncError } from './store'
import { ToastProvider, useToast } from './ui'
import Auth, { Logo } from './screens/Auth'
import OwnerApp from './screens/Owner'
import { useRoute } from './router'

function SyncErrors() {
  const toast = useToast()
  useEffect(() => onSyncError((m) => toast(m, { tone: 'danger', ms: 5000 })), [toast])
  return null
}

function Splash() {
  return (
    <div className="splash">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Logo />
      </motion.div>
      <span className="splash-bar"><i /></span>
    </div>
  )
}

export default function App() {
  const route = useRoute()
  const session = useSession()
  const ready = useReady()
  const db = useDB()

  let screen
  if (!ready) screen = <Splash key="splash" />
  else if (session?.role === 'owner' && db.owners.some((o) => o.id === session.id)) screen = <OwnerApp key="owner" route={route} />
  else if (session?.role === 'owner') screen = <Splash key="splash" />
  else screen = <Auth key="auth" />

  return (
    <ToastProvider>
      <SyncErrors />
      <AnimatePresence mode="wait">
        <motion.div key={screen.key} className="root-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {screen}
        </motion.div>
      </AnimatePresence>
    </ToastProvider>
  )
}
