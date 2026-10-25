import { useEffect, useMemo, useRef, useState } from 'react'
import { LuArrowRight, LuClipboardList, LuCompass, LuHeart, LuHouse, LuPlus, LuSearch, LuUser } from 'react-icons/lu'
import { Link, buildHref, navigate } from '../lib/router'
import { useStore } from '../store'
import { Modal, Wordmark, CATEGORY_ICON } from './ui'
import { PRODUCTS } from '../data/products'
import { CATEGORY_BY_ID } from '../data/categories'
import { normalize, initials } from '../lib/text'
import { searchProducts } from '../lib/search'

const NAV = [
  { to: '/', label: 'Inicio', match: (p: string) => p === '/' },
  { to: '/catalogo', label: 'Catálogo', match: (p: string) => p.startsWith('/catalogo') || p.startsWith('/producto') },
  { to: '/solicitar', label: 'Solicitar', match: (p: string) => p === '/solicitar' },
  { to: '/solicitudes', label: 'Mis solicitudes', match: (p: string) => p === '/solicitudes' },
]

export function Header({ path }: { path: string }) {
  const { favorites, session, requests } = useStore()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [])

  return (
    <>
      <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container header__row">
          <Link to="/" className="header__brand" aria-label="aka dosa — Inicio">
            <Wordmark />
          </Link>

          <nav className="header__nav" aria-label="Principal">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={`navlink${n.match(path) ? ' is-active' : ''}`} aria-current={n.match(path) ? 'page' : undefined}>
                {n.label}
                {n.to === '/solicitudes' && requests.length > 0 && <sup>{requests.length}</sup>}
              </Link>
            ))}
          </nav>

          <div className="header__tools">
            <button type="button" className="searchtrigger" onClick={() => setSearchOpen(true)} aria-label="Buscar productos">
              <LuSearch aria-hidden />
              <span>Buscar productos</span>
              <kbd>Ctrl K</kbd>
            </button>
            <Link to="/favoritos" className={`iconbtn iconbtn--badge${path === '/favoritos' ? ' is-active' : ''}`} aria-label={`Favoritos (${favorites.length})`}>
              <LuHeart aria-hidden />
              {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
            </Link>
            <Link to="/perfil" className={`avatar${path === '/perfil' ? ' is-active' : ''}`} aria-label="Perfil del cliente">
              {session ? initials(session.name) : <LuUser aria-hidden />}
            </Link>
            <Link to="/solicitar" className="btn btn--primary btn--sm header__cta">
              <LuPlus aria-hidden /> Solicitar un producto
            </Link>
          </div>

          <button type="button" className="iconbtn header__mobile-search" aria-label="Buscar productos" onClick={() => setSearchOpen(true)}>
            <LuSearch aria-hidden />
          </button>
        </div>
      </header>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <TabBar path={path} />
    </>
  )
}

function TabBar({ path }: { path: string }) {
  const { favorites, session } = useStore()
  const items = [
    { to: '/', label: 'Inicio', icon: <LuHouse />, on: path === '/' },
    { to: '/catalogo', label: 'Catálogo', icon: <LuCompass />, on: path.startsWith('/catalogo') || path.startsWith('/producto') },
    { to: '/solicitar', label: 'Solicitar', icon: <LuPlus />, on: path === '/solicitar', primary: true },
    { to: '/favoritos', label: 'Favoritos', icon: <LuHeart />, on: path === '/favoritos', badge: favorites.length },
    { to: '/perfil', label: session ? 'Perfil' : 'Entrar', icon: <LuUser />, on: path === '/perfil' || path === '/solicitudes' || path === '/ayuda' },
  ]
  return (
    <nav className="tabbar" aria-label="Navegación móvil">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className={`tabbar__item${i.on ? ' is-active' : ''}${i.primary ? ' is-primary' : ''}`} aria-current={i.on ? 'page' : undefined}>
          <span className="tabbar__icon" aria-hidden="true">
            {i.icon}
            {!!i.badge && <span className="badge">{i.badge}</span>}
          </span>
          <span>{i.label}</span>
        </Link>
      ))}
    </nav>
  )
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo(() => (normalize(q) ? searchProducts(PRODUCTS, q).slice(0, 6).map((r) => r.product) : []), [q])

  useEffect(() => {
    if (open) setQ('')
  }, [open])
  useEffect(() => { setCursor(0); moved.current = false }, [q])

  const go = (to: string) => {
    onClose()
    navigate(to)
  }

  const moved = useRef(false)
  const submit = () => {
    if (moved.current && results[cursor]) go(`/producto/${results[cursor].id}`)
    else go(buildHref('/catalogo', { q: q.trim() }))
  }

  return (
    <Modal open={open} onClose={onClose} title="Buscar productos" variant="top" hideTitle>
      <form
        className="qsearch"
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <LuSearch aria-hidden className="qsearch__icon" />
        <input
          ref={inputRef}
          data-autofocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, marca, modelo o categoría…"
          aria-label="Buscar productos"
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); moved.current = true; setCursor((c) => Math.min(results.length - 1, c + 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); moved.current = true; setCursor((c) => Math.max(0, c - 1)) }
          }}
        />
      </form>
      <div className="qsearch__results">
        {!q.trim() && (
          <div className="qsearch__hint">
            <p>Prueba con</p>
            <div className="chips">
              {['DDR5', 'Auriculares', 'Cámara', 'Zapatillas', 'SSD'].map((s) => (
                <button key={s} type="button" className="chip" onClick={() => setQ(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
        {q.trim() && results.length > 0 && (
          <ul role="listbox" aria-label="Sugerencias">
            {results.map((p, i) => {
              const Icon = CATEGORY_ICON[p.categoryId]
              return (
                <li key={p.id} role="option" aria-selected={i === cursor}>
                  <button type="button" className={`qsearch__item${i === cursor ? ' is-active' : ''}`} onMouseEnter={() => setCursor(i)} onClick={() => go(`/producto/${p.id}`)}>
                    <span className="qsearch__thumb" style={{ background: CATEGORY_BY_ID[p.categoryId].bg, color: CATEGORY_BY_ID[p.categoryId].fg }}><Icon aria-hidden /></span>
                    <span className="qsearch__meta">
                      <strong>{p.name}</strong>
                      <small>{p.brand} · {CATEGORY_BY_ID[p.categoryId].name}</small>
                    </span>
                    <LuArrowRight aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {q.trim() && results.length === 0 && (
          <div className="qsearch__none">
            <p>No encontramos «{q.trim()}» en el catálogo.</p>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => go(buildHref('/solicitar', { q: q.trim() }))}>
              <LuClipboardList aria-hidden /> Solicitarlo
            </button>
          </div>
        )}
        {q.trim() && (
          <button type="button" className="qsearch__all" onClick={() => go(buildHref('/catalogo', { q: q.trim() }))}>
            Ver todos los resultados para «{q.trim()}» <LuArrowRight aria-hidden />
          </button>
        )}
      </div>
    </Modal>
  )
}
