import { useEffect, useState, type AnchorHTMLAttributes, type ReactNode } from 'react'

export interface Route {
  path: string
  params: URLSearchParams
}

function parseRaw(raw: string): Route {
  const [path, qs = ''] = raw.replace(/^#/, '').split('?')
  return { path: path || '/', params: new URLSearchParams(qs) }
}

/** La ruta vive en memoria (funciona aunque el entorno bloquee location.hash) y se refleja en el hash cuando es posible. */
let current: Route = (() => {
  const h = typeof window !== 'undefined' ? window.location.hash : ''
  return h.startsWith('#/') ? parseRaw(h) : { path: '/', params: new URLSearchParams() }
})()
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function parseHash(): Route {
  return current
}

export function buildHref(path: string, params?: Record<string, string | undefined | null>) {
  const sp = new URLSearchParams()
  Object.entries(params ?? {}).forEach(([k, v]) => {
    if (v) sp.set(k, v)
  })
  const qs = sp.toString()
  return qs ? `${path}?${qs}` : path
}

export function navigate(to: string, opts?: { replace?: boolean }) {
  current = parseRaw(to)
  try {
    const url = window.location.pathname + window.location.search + '#' + to
    if (opts?.replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
  } catch {
    /* entornos con hash bloqueado: la ruta en memoria basta */
  }
  emit()
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith('#/')) {
      current = parseRaw(window.location.hash)
      emit()
    }
  })
  window.addEventListener('popstate', () => {
    if (window.location.hash.startsWith('#/')) {
      current = parseRaw(window.location.hash)
      emit()
    }
  })
  // Los enlaces internos (#/ruta) se resuelven sin depender del navegador.
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = (e.target as Element | null)?.closest?.('a[href^="#/"]') as HTMLAnchorElement | null
    if (!a || (a.target && a.target !== '_self')) return
    e.preventDefault()
    navigate(a.getAttribute('href')!.slice(1))
  })
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(current)
  useEffect(() => {
    const on = () => setRoute(current)
    listeners.add(on)
    on()
    return () => {
      listeners.delete(on)
    }
  }, [])
  return route
}

export function Link({ to, children, ...rest }: { to: string; children: ReactNode } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  return (
    <a href={'#' + to} {...rest}>
      {children}
    </a>
  )
}
