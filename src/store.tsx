import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { DEMO_ACCOUNT, INSTAGRAM_URL, STORAGE_KEYS } from './config'
import type { CategoryId, Prefs, ProductRequest, RequestStatus, Session } from './types'
import { clearDemoData, read, remove, storageHealthy, write } from './lib/storage'
import { copyText } from './lib/summary'
import { isValidEmail, makeRequestId } from './lib/text'
import { navigate } from './lib/router'
import { Modal } from './components/ui'
import { LuCheck, LuCopy, LuInfo, LuTriangleAlert } from 'react-icons/lu'
import { InstagramGlyph } from './components/ui'

type AuthResult = { ok: true } | { ok: false; field?: 'name' | 'email' | 'password'; error: string }

export interface NewRequest {
  name: string
  description: string
  category: string
  brandModel: string
  link: string
  market: string
  specs: string
  quantity: number
  notes: string
  origin: string
}

interface HandoffOptions {
  title: string
  text: string
  onOpened?: () => void
}

interface Store {
  session: Session | null
  login: (email: string, password: string) => AuthResult
  register: (name: string, email: string, password: string) => AuthResult
  loginDemo: () => void
  logout: () => void
  updateName: (name: string) => void
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string, label?: string) => void
  requests: ProductRequest[]
  addRequest: (r: NewRequest) => ProductRequest
  setRequestStatus: (id: string, s: RequestStatus) => void
  removeRequest: (id: string) => void
  prefs: Prefs
  toggleInterest: (c: CategoryId) => void
  resetDemo: () => void
  notify: (message: string, tone?: 'ok' | 'info' | 'warn') => void
  copy: (text: string, okMsg?: string) => Promise<boolean>
  openHandoff: (o: HandoffOptions) => void
  storageOk: boolean
}

const Ctx = createContext<Store | null>(null)

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore fuera de AppProvider')
  return s
}

interface ToastItem {
  id: number
  message: string
  tone: 'ok' | 'info' | 'warn'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => read<Session | null>(STORAGE_KEYS.session, null))
  const [favorites, setFavorites] = useState<string[]>(() => read<string[]>(STORAGE_KEYS.favorites, []))
  const [requests, setRequests] = useState<ProductRequest[]>(() => read<ProductRequest[]>(STORAGE_KEYS.requests, []))
  const [prefs, setPrefs] = useState<Prefs>(() => read<Prefs>(STORAGE_KEYS.prefs, { interests: [] }))
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [handoff, setHandoff] = useState<(HandoffOptions & { status: 'idle' | 'copied' | 'failed' }) | null>(null)
  const toastId = useRef(0)

  const persist = <T,>(key: string, value: T) => write(key, value)

  const notify = useCallback((message: string, tone: 'ok' | 'info' | 'warn' = 'ok') => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { id, message, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800)
  }, [])

  const profiles = () => read<Record<string, string>>('profiles', {})

  const startSession = (s: Session) => {
    setSession(s)
    persist(STORAGE_KEYS.session, s)
  }

  const login: Store['login'] = (email, password) => {
    if (!email.trim()) return { ok: false, field: 'email', error: 'Escribe tu correo electrónico.' }
    if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'Revisa el correo: debe tener el formato nombre@dominio.com.' }
    if (!password) return { ok: false, field: 'password', error: 'Escribe tu contraseña.' }
    if (password.length < 8) return { ok: false, field: 'password', error: 'La contraseña debe tener al menos 8 caracteres.' }
    const e = email.trim().toLowerCase()
    const name = profiles()[e] ?? e.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
    startSession({ name, email: e, demo: e === DEMO_ACCOUNT.email })
    return { ok: true }
  }

  const register: Store['register'] = (name, email, password) => {
    if (name.trim().length < 2) return { ok: false, field: 'name', error: 'Escribe tu nombre (mínimo 2 caracteres).' }
    if (!email.trim()) return { ok: false, field: 'email', error: 'Escribe tu correo electrónico.' }
    if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'Revisa el correo: debe tener el formato nombre@dominio.com.' }
    if (password.length < 8) return { ok: false, field: 'password', error: 'Crea una contraseña de al menos 8 caracteres.' }
    if (!/\d/.test(password) || !/[A-Za-z]/.test(password)) return { ok: false, field: 'password', error: 'Combina letras y números en la contraseña.' }
    const e = email.trim().toLowerCase()
    // Solo se guarda el nombre asociado al correo. Nunca la contraseña.
    write('profiles', { ...profiles(), [e]: name.trim() })
    startSession({ name: name.trim(), email: e, demo: false })
    return { ok: true }
  }

  const loginDemo = () => startSession({ name: DEMO_ACCOUNT.name, email: DEMO_ACCOUNT.email, demo: true })

  const logout = () => {
    setSession(null)
    remove(STORAGE_KEYS.session)
    navigate('/login')
  }

  const updateName = (name: string) => {
    if (!session) return
    const s = { ...session, name: name.trim() || session.name }
    setSession(s)
    persist(STORAGE_KEYS.session, s)
  }

  const toggleFavorite: Store['toggleFavorite'] = (id, label) => {
    setFavorites((cur) => {
      const has = cur.includes(id)
      const next = has ? cur.filter((x) => x !== id) : [...cur, id]
      persist(STORAGE_KEYS.favorites, next)
      return next
    })
    const has = favorites.includes(id)
    notify(has ? `${label ?? 'Producto'} se quitó de favoritos` : `${label ?? 'Producto'} se guardó en favoritos`, 'info')
  }

  const addRequest: Store['addRequest'] = (r) => {
    const req: ProductRequest = { ...r, id: makeRequestId(), createdAt: new Date().toISOString(), status: 'pendiente' }
    setRequests((cur) => {
      const next = [req, ...cur]
      persist(STORAGE_KEYS.requests, next)
      return next
    })
    return req
  }

  const setRequestStatus: Store['setRequestStatus'] = (id, s) =>
    setRequests((cur) => {
      const next = cur.map((r) => (r.id === id ? { ...r, status: s } : r))
      persist(STORAGE_KEYS.requests, next)
      return next
    })

  const removeRequest: Store['removeRequest'] = (id) =>
    setRequests((cur) => {
      const next = cur.filter((r) => r.id !== id)
      persist(STORAGE_KEYS.requests, next)
      return next
    })

  const toggleInterest: Store['toggleInterest'] = (c) =>
    setPrefs((cur) => {
      const interests = cur.interests.includes(c) ? cur.interests.filter((x) => x !== c) : [...cur.interests, c]
      const next = { interests }
      persist(STORAGE_KEYS.prefs, next)
      return next
    })

  const resetDemo = () => {
    clearDemoData()
    setFavorites([])
    setRequests([])
    setPrefs({ interests: [] })
    setSession(null)
    navigate('/login')
    notify('Datos de demostración restablecidos', 'info')
  }

  const copy: Store['copy'] = async (text, okMsg = 'Resumen copiado al portapapeles') => {
    const ok = await copyText(text)
    notify(ok ? okMsg : 'No pudimos copiar automáticamente. Selecciona el texto y cópialo.', ok ? 'ok' : 'warn')
    return ok
  }

  const openHandoff: Store['openHandoff'] = (o) => {
    setHandoff({ ...o, status: 'idle' })
    // El clic del usuario sigue activo: intentamos copiar de inmediato.
    copyText(o.text).then((ok) => setHandoff((h) => (h ? { ...h, status: ok ? 'copied' : 'failed' } : h)))
  }

  // Sincroniza cambios de otras pestañas
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (!e.key || !e.key.includes('akadosa:v1:')) return
      setSession(read<Session | null>(STORAGE_KEYS.session, null))
      setFavorites(read<string[]>(STORAGE_KEYS.favorites, []))
      setRequests(read<ProductRequest[]>(STORAGE_KEYS.requests, []))
      setPrefs(read<Prefs>(STORAGE_KEYS.prefs, { interests: [] }))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const value: Store = useMemo(
    () => ({
      session, login, register, loginDemo, logout, updateName,
      favorites, isFavorite: (id) => favorites.includes(id), toggleFavorite,
      requests, addRequest, setRequestStatus, removeRequest,
      prefs, toggleInterest, resetDemo, notify, copy, openHandoff,
      storageOk: storageHealthy(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, favorites, requests, prefs],
  )


  return (
    <Ctx.Provider value={value}>
      {children}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            {t.tone === 'warn' ? <LuTriangleAlert aria-hidden /> : t.tone === 'info' ? <LuInfo aria-hidden /> : <LuCheck aria-hidden />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <Modal open={!!handoff} onClose={() => setHandoff(null)} title={handoff?.title ?? ''} variant="center" labelledBy="handoff-title">
        {handoff && (
          <div className="handoff">
            <p className="handoff__lead">
              Preparamos un resumen para que lo pegues en un mensaje directo. <strong>No se envía automáticamente</strong>: la conversación continúa en Instagram.
            </p>
            <div className={`handoff__status handoff__status--${handoff.status}`} aria-live="polite">
              {handoff.status === 'copied' && (<><LuCheck aria-hidden /> Resumen copiado al portapapeles</>)}
              {handoff.status === 'failed' && (<><LuTriangleAlert aria-hidden /> No pudimos copiarlo automáticamente. Usa «Copiar resumen» o selecciona el texto.</>)}
              {handoff.status === 'idle' && <>Copiando resumen…</>}
            </div>
            <label className="sr-only" htmlFor="handoff-text">Resumen para copiar</label>
            <textarea
              id="handoff-text"
              className="handoff__text"
              readOnly
              value={handoff.text}
              rows={9}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="handoff__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={async () => {
                  const ok = await copyText(handoff.text)
                  setHandoff((h) => (h ? { ...h, status: ok ? 'copied' : 'failed' } : h))
                }}
              >
                <LuCopy aria-hidden /> Copiar resumen
              </button>
              <a className="btn btn--primary" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" onClick={() => handoff.onOpened?.()}>
                <InstagramGlyph /> Abrir Instagram
              </a>
            </div>
            <p className="handoff__hint">Al abrir Instagram se mostrará el perfil oficial. Escríbenos por mensaje directo y pega el resumen. Los precios y la disponibilidad se coordinan allí.</p>
          </div>
        )}
      </Modal>
    </Ctx.Provider>
  )
}
