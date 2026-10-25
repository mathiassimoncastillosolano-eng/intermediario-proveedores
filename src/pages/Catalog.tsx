import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { LuArrowRight, LuPackageSearch, LuRotateCcw, LuSearch, LuSlidersHorizontal, LuTriangleAlert, LuX } from 'react-icons/lu'
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories'
import { PRODUCTS } from '../data/products'
import { buildHref, navigate, type Route } from '../lib/router'
import { searchProducts } from '../lib/search'
import { ProductCard } from '../components/ProductCard'
import { Button, Checkbox, EmptyState, Modal, Select } from '../components/ui'
import type { Product } from '../types'

const PAGE = 12
const SORTS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
  { value: 'reciente', label: 'Añadidos recientemente' },
]

interface Filters {
  q: string
  cat: string
  brand: string[]
  type: string[]
  tag: string[]
  sort: string
}

function readFilters(params: URLSearchParams): Filters {
  const list = (k: string) => (params.get(k) ? params.get(k)!.split('|').filter(Boolean) : [])
  return { q: params.get('q') ?? '', cat: params.get('cat') ?? '', brand: list('brand'), type: list('type'), tag: list('tag'), sort: params.get('sort') ?? 'relevancia' }
}

function writeFilters(f: Filters) {
  navigate(
    buildHref('/catalogo', {
      q: f.q || undefined,
      cat: f.cat || undefined,
      brand: f.brand.join('|') || undefined,
      type: f.type.join('|') || undefined,
      tag: f.tag.join('|') || undefined,
      sort: f.sort !== 'relevancia' ? f.sort : undefined,
    }),
    { replace: true },
  )
}

class Boundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  render() {
    if (this.state.error) {
      return (
        <EmptyState tone="error" icon={<LuTriangleAlert />} title="Algo no salió como esperábamos" actions={<Button variant="ink" onClick={() => this.setState({ error: false })}><LuRotateCcw aria-hidden /> Reintentar</Button>}>
          No pudimos mostrar los resultados. Puedes reintentar o volver a cargar la página.
        </EmptyState>
      )
    }
    return this.props.children
  }
}

export function CatalogPage({ route }: { route: Route }) {
  const f = useMemo(() => readFilters(route.params), [route.params])
  const [qLocal, setQLocal] = useState(f.q)
  const [shown, setShown] = useState(PAGE)
  const [drawer, setDrawer] = useState(false)
  const debounce = useRef<number | undefined>(undefined)

  useEffect(() => setQLocal(f.q), [f.q])
  useEffect(() => setShown(PAGE), [route.params.toString()])

  const update = (patch: Partial<Filters>) => writeFilters({ ...f, ...patch })

  const onQuery = (v: string) => {
    setQLocal(v)
    window.clearTimeout(debounce.current)
    debounce.current = window.setTimeout(() => update({ q: v }), 160)
  }

  // Base: categoría + búsqueda (para calcular facetas)
  const base = useMemo(() => {
    const scoped = f.cat ? PRODUCTS.filter((p) => p.categoryId === f.cat) : PRODUCTS
    return searchProducts(scoped, f.q)
  }, [f.cat, f.q])

  const facets = useMemo(() => {
    const count = (get: (p: Product) => string[]) => {
      const m = new Map<string, number>()
      base.forEach(({ product }) => get(product).forEach((v) => m.set(v, (m.get(v) ?? 0) + 1)))
      return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    }
    return { brand: count((p) => [p.brand]), type: count((p) => [p.type]), tag: count((p) => p.tags) }
  }, [base])

  const results = useMemo(() => {
    let r = base.filter(({ product: p }) => {
      if (f.brand.length && !f.brand.includes(p.brand)) return false
      if (f.type.length && !f.type.includes(p.type)) return false
      if (f.tag.length && !f.tag.every((t) => p.tags.includes(t))) return false
      return true
    })
    r = [...r]
    if (f.sort === 'nombre') r.sort((a, b) => a.product.name.localeCompare(b.product.name, 'es'))
    else if (f.sort === 'reciente') r.sort((a, b) => b.product.addedAt.localeCompare(a.product.addedAt))
    else r.sort((a, b) => b.score - a.score || Number(!!b.product.featured) - Number(!!a.product.featured) || b.product.addedAt.localeCompare(a.product.addedAt))
    return r.map((x) => x.product)
  }, [base, f.brand, f.type, f.tag, f.sort])

  const active: { key: string; label: string; remove: () => void }[] = []
  if (f.cat) active.push({ key: 'cat', label: CATEGORY_BY_ID[f.cat]?.name ?? f.cat, remove: () => update({ cat: '', brand: [], type: [], tag: [] }) })
  f.brand.forEach((b) => active.push({ key: 'b' + b, label: b, remove: () => update({ brand: f.brand.filter((x) => x !== b) }) }))
  f.type.forEach((b) => active.push({ key: 't' + b, label: b, remove: () => update({ type: f.type.filter((x) => x !== b) }) }))
  f.tag.forEach((b) => active.push({ key: 'g' + b, label: b, remove: () => update({ tag: f.tag.filter((x) => x !== b) }) }))
  const hasFilters = active.length > 0
  const clearAll = () => writeFilters({ ...f, cat: '', brand: [], type: [], tag: [] })
  const toggle = (k: 'brand' | 'type' | 'tag', v: string) => update({ [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] } as Partial<Filters>)

  const panel = (
    <FilterPanel f={f} facets={facets} toggle={toggle} setCat={(cat) => update({ cat, brand: [], type: [], tag: [] })} />
  )

  return (
    <div className="container page catalog">
      <header className="catalog__head">
        <div>
          <p className="eyebrow">Catálogo internacional</p>
          <h1 className="h1">Todo lo que <em>podemos buscar</em></h1>
        </div>
        <p className="catalog__note">Sin precios a propósito: la cotización y la disponibilidad se coordinan por Instagram.</p>
      </header>

      <div className="toolbar">
        <form className="searchbox" role="search" onSubmit={(e) => { e.preventDefault(); window.clearTimeout(debounce.current); update({ q: qLocal }) }}>
          <LuSearch aria-hidden />
          <input type="search" value={qLocal} onChange={(e) => onQuery(e.target.value)} placeholder="Busca por nombre, marca, modelo o categoría" aria-label="Buscar en el catálogo" />
          {qLocal && (
            <button type="button" className="iconbtn iconbtn--sm" aria-label="Borrar búsqueda" onClick={() => { setQLocal(''); update({ q: '' }) }}><LuX aria-hidden /></button>
          )}
        </form>
        <div className="toolbar__sort">
          <Select label="Ordenar por" hideLabel value={f.sort} onChange={(v) => update({ sort: v })} options={SORTS} compact />
        </div>
        <button type="button" className="btn btn--outline toolbar__filters" onClick={() => setDrawer(true)}>
          <LuSlidersHorizontal aria-hidden /> Filtros{hasFilters && <span className="badge badge--inline">{active.length}</span>}
        </button>
      </div>

      <div className="catscroll" role="group" aria-label="Categorías">
        <button type="button" className={`chip chip--lg${!f.cat ? ' is-on' : ''}`} onClick={() => update({ cat: '', brand: [], type: [], tag: [] })} aria-pressed={!f.cat}>Todas</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={`chip chip--lg${f.cat === c.id ? ' is-on' : ''}`} onClick={() => update({ cat: c.id, brand: [], type: [], tag: [] })} aria-pressed={f.cat === c.id}>
            {c.short}
          </button>
        ))}
      </div>

      <div className="catalog__layout">
        <aside className="catalog__aside" aria-label="Filtros">{panel}</aside>

        <section aria-live="polite" className="catalog__results">
          <div className="results__bar">
            <p className="results__count">
              <strong>{results.length}</strong> {results.length === 1 ? 'producto' : 'productos'}
              {f.q && <> para «{f.q}»</>}
            </p>
            {(hasFilters || f.q) && (
              <button type="button" className="linkbtn" onClick={() => { setQLocal(''); writeFilters({ q: '', cat: '', brand: [], type: [], tag: [], sort: f.sort }) }}>
                <LuRotateCcw aria-hidden /> Limpiar todo
              </button>
            )}
          </div>

          {active.length > 0 && (
            <ul className="activechips" aria-label="Filtros activos">
              {active.map((a) => (
                <li key={a.key}>
                  <button type="button" className="chip chip--on" onClick={a.remove} aria-label={`Quitar filtro ${a.label}`}>
                    {a.label} <LuX aria-hidden />
                  </button>
                </li>
              ))}
              <li><button type="button" className="linkbtn" onClick={clearAll}>Quitar filtros</button></li>
            </ul>
          )}

          <Boundary>
            {results.length === 0 ? (
              <EmptyState
                icon={<LuPackageSearch />}
                title={f.q ? `Sin resultados para «${f.q}»` : 'Sin resultados con estos filtros'}
                actions={
                  <>
                    <Button href={buildHref('/solicitar', { q: f.q || undefined })} variant="primary" size="lg">
                      {f.q ? <>Solicitar «{f.q}»</> : <>Solicitar un producto</>} <LuArrowRight aria-hidden />
                    </Button>
                    {(hasFilters || f.q) && (
                      <Button variant="outline" onClick={() => { setQLocal(''); writeFilters({ q: '', cat: '', brand: [], type: [], tag: [], sort: f.sort }) }}><LuRotateCcw aria-hidden /> Limpiar búsqueda y filtros</Button>
                    )}
                  </>
                }
              >
                No encontramos ese producto. Puedes solicitarlo y describir lo que necesitas.
              </EmptyState>
            ) : (
              <>
                {!f.q && !hasFilters && (
                  <div className="hintrow">
                    <span>Escribe para buscar, o prueba con</span>
                    {['DDR5', 'Auriculares', 'Mirrorless', 'Zapatillas', 'Maquillaje'].map((s) => (
                      <button key={s} type="button" className="chip" onClick={() => { setQLocal(s); update({ q: s }) }}>{s}</button>
                    ))}
                  </div>
                )}
                <div className="grid">
                  {results.slice(0, shown).map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
                {shown < results.length && (
                  <div className="more">
                    <p>Mostrando {Math.min(shown, results.length)} de {results.length}</p>
                    <Button variant="outline" size="lg" onClick={() => setShown((s) => s + PAGE)}>Mostrar más</Button>
                  </div>
                )}
                <aside className="inlinecta">
                  <div>
                    <h3>¿No ves lo que buscas?</h3>
                    <p>Cuéntanos qué necesitas: lo buscamos aunque no esté en el catálogo.</p>
                  </div>
                  <Button href={buildHref('/solicitar', { q: f.q || undefined })} variant="primary">Solicitar un producto <LuArrowRight aria-hidden /></Button>
                </aside>
              </>
            )}
          </Boundary>
        </section>
      </div>

      <Modal open={drawer} onClose={() => setDrawer(false)} title="Filtros" variant="sheet">
        {panel}
        <div className="sheet__foot">
          <Button variant="ghost" onClick={clearAll} disabled={!hasFilters}>Limpiar</Button>
          <Button variant="ink" onClick={() => setDrawer(false)}>Ver {results.length} {results.length === 1 ? 'resultado' : 'resultados'}</Button>
        </div>
      </Modal>
    </div>
  )
}

function FilterPanel({
  f, facets, toggle, setCat,
}: {
  f: Filters
  facets: { brand: [string, number][]; type: [string, number][]; tag: [string, number][] }
  toggle: (k: 'brand' | 'type' | 'tag', v: string) => void
  setCat: (c: string) => void
}) {
  return (
    <div className="filters">
      <Group title="Categoría">
        <div className="radiolist" role="radiogroup" aria-label="Categoría">
          <button type="button" role="radio" aria-checked={!f.cat} className={`radio${!f.cat ? ' is-on' : ''}`} onClick={() => setCat('')}><i />Todas</button>
          {CATEGORIES.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={f.cat === c.id} className={`radio${f.cat === c.id ? ' is-on' : ''}`} onClick={() => setCat(c.id)}><i />{c.name}</button>
          ))}
        </div>
      </Group>
      <Group title="Marca" empty={!facets.brand.length}>
        {facets.brand.map(([v, n]) => <Checkbox key={v} label={v} count={n} checked={f.brand.includes(v)} onChange={() => toggle('brand', v)} />)}
      </Group>
      <Group title="Tipo de producto" empty={!facets.type.length}>
        {facets.type.map(([v, n]) => <Checkbox key={v} label={v} count={n} checked={f.type.includes(v)} onChange={() => toggle('type', v)} />)}
      </Group>
      <Group title="Características" empty={!facets.tag.length}>
        {facets.tag.map(([v, n]) => <Checkbox key={v} label={v} count={n} checked={f.tag.includes(v)} onChange={() => toggle('tag', v)} />)}
      </Group>
    </div>
  )
}

function Group({ title, children, empty }: { title: string; children: ReactNode; empty?: boolean }) {
  const [open, setOpen] = useState(true)
  if (empty) return null
  return (
    <div className={`fgroup${open ? ' is-open' : ''}`}>
      <button type="button" className="fgroup__head" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <span className="fgroup__sign" aria-hidden="true" />
      </button>
      {open && <div className="fgroup__body">{children}</div>}
    </div>
  )
}
