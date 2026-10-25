import { useRef } from 'react'
import { LuArrowRight, LuArrowUpRight, LuChevronDown, LuGlobe, LuInfo, LuSearch, LuMessageCircle, LuCompass } from 'react-icons/lu'
import { PROVIDER_BRANDS } from '../data/brands'
import { CATEGORIES, CATEGORY_BY_ID } from '../data/categories'
import { COUNTRIES, COUNTRY_BY_ID } from '../data/countries'
import { PRODUCT_BY_ID, PRODUCTS } from '../data/products'
import { DELIVERY_NOTICE } from '../config'
import { buildHref } from '../lib/router'
import { ProductCard } from '../components/ProductCard'
import { Button, CATEGORY_ICON, ProductPlate, Reveal, Tag } from '../components/ui'
import { useStore } from '../store'

const HERO = ['iphone-15-pro', 'sony-wh-1000xm5', 'sony-a7-iv'].map((id) => PRODUCT_BY_ID[id])

export function HomePage() {
  const { session } = useStore()
  const first = session?.name.split(' ')[0]
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero__grid">
          <div className="hero__copy">
            <p className="eyebrow rise" style={{ '--d': '0ms' } as React.CSSProperties}>
              {first ? `Hola, ${first}` : 'Búsqueda internacional'} · coordinación por Instagram
            </p>
            <h1 className="hero__title rise" style={{ '--d': '80ms' } as React.CSSProperties}>
              Descubre lo que el <em>mundo</em> tiene para ti.
            </h1>
            <p className="hero__lead rise" style={{ '--d': '160ms' } as React.CSSProperties}>
              Encuentra inspiración en productos internacionales y cuéntanos qué te gustaría conseguir. Nosotros te ayudamos a iniciar la búsqueda.
            </p>
            <div className="hero__cta rise" style={{ '--d': '240ms' } as React.CSSProperties}>
              <Button href="/catalogo" variant="ink" size="lg"><LuCompass aria-hidden /> Explorar el catálogo</Button>
              <Button href="/solicitar" variant="outline" size="lg">Solicitar un producto <LuArrowRight aria-hidden /></Button>
            </div>
            <ul className="hero__facts rise" style={{ '--d': '320ms' } as React.CSSProperties}>
              <li><strong>Sin precios</strong> en pantalla</li>
              <li><strong>Sin pagos</strong> en la plataforma</li>
              <li><strong>Cotización</strong> directa por Instagram</li>
            </ul>
          </div>

          <div className="hero__art" aria-hidden="true">
            <div className="hero__badge">
              <svg viewBox="0 0 200 200">
                <defs><path id="hc" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" /></defs>
                <text><textPath href="#hc" textLength="494" lengthAdjust="spacing">PRODUCTOS · MARCAS · PAÍSES · PRODUCTOS · MARCAS · PAÍSES ·</textPath></text>
              </svg>
              <LuGlobe />
            </div>
            <div className="hero__plate hero__plate--a rise" style={{ '--d': '150ms' } as React.CSSProperties}><ProductPlate product={HERO[0]} variant={0} /></div>
            <div className="hero__plate hero__plate--b rise" style={{ '--d': '300ms' } as React.CSSProperties}><ProductPlate product={HERO[1]} variant={1} /></div>
            <div className="hero__plate hero__plate--c rise" style={{ '--d': '450ms' } as React.CSSProperties}><ProductPlate product={HERO[2]} variant={2} /></div>
            <span className="hero__coords">35.7° N · 139.7° E<br />38.9° N · 77.0° O</span>
          </div>
        </div>
        <a href="#categorias" className="hero__scroll" aria-label="Ir a categorías"><LuChevronDown aria-hidden /></a>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker__track">
          {[0, 1].map((k) => (
            <span key={k}>
              {CATEGORIES.map((c) => <b key={c.id + k}>{c.name}<i>✦</i></b>)}
            </span>
          ))}
        </div>
      </div>

      {/* CATEGORIAS */}
      <section className="section" id="categorias">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <div>
                <p className="eyebrow">Categorías</p>
                <h2 className="h2">¿Por dónde quieres empezar?</h2>
              </div>
              <p className="section__aside">Elige una categoría y entra directo al catálogo filtrado.</p>
            </div>
          </Reveal>
          <div className="bento">
            {CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICON[c.id]
              const n = PRODUCTS.filter((p) => p.categoryId === c.id).length
              return (
                <Reveal key={c.id} delay={(i % 4) * 60} className={`bento__cell bento__cell--${i}`}>
                  <a href={'#' + buildHref('/catalogo', { cat: c.id })} className="tile" style={{ background: c.bg, color: c.fg, '--accent': c.accent } as React.CSSProperties}>
                    <Icon className="tile__bg" aria-hidden strokeWidth={0.8} />
                    <span className="tile__num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="tile__body">
                      <span className="tile__name">{c.name}</span>
                      <span className="tile__blurb">{c.blurb}</span>
                    </span>
                    <span className="tile__foot">
                      <span>{n > 0 ? `${n} en el catálogo demo` : 'Solicítalo'}</span>
                      <LuArrowUpRight aria-hidden />
                    </span>
                  </a>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* DESTACADOS */}
      <FeaturedRail />

      {/* CTA */}
      <section className="section section--tight">
        <div className="container">
          <Reveal>
            <div className="cta">
              <div className="cta__rings" aria-hidden="true"><span /><span /><span /></div>
              <p className="eyebrow eyebrow--light">Fuera de catálogo</p>
              <h2 className="cta__title">¿Tienes algo <em>específico</em> en mente?</h2>
              <p className="cta__text">Cuéntanos qué producto estás buscando, aunque no aparezca en nuestro catálogo.</p>
              <Button href="/solicitar" variant="light" size="lg">Solicitar un producto <LuArrowRight aria-hidden /></Button>
              <span className="cta__q" aria-hidden="true">?</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PAISES */}
      <section className="section" id="paises">
        <div className="container countries">
          <Reveal className="countries__intro">
            <p className="eyebrow">Red de proveedores</p>
            <h2 className="h2">Dónde están nuestros <em>contactos</em></h2>
            <p className="lead">Ubicaciones donde existen proveedores o contactos comerciales asociados. Es un directorio informativo: no se puede filtrar ni elegir.</p>
            <div className="notice" role="note">
              <LuInfo aria-hidden />
              <p>{DELIVERY_NOTICE}</p>
            </div>
            <Tag tone="demo">Datos de demostración · reemplazables</Tag>
          </Reveal>
          <ol className="countries__list">
            {COUNTRIES.map((c, i) => (
              <Reveal as="li" key={c.id} delay={i * 50} className="country">
                <>
                  <div className="country__stamp" style={{ background: c.tone, color: c.ink }} aria-hidden="true">
                    <span>{c.code}</span>
                  </div>
                  <div className="country__main">
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                  </div>
                  <div className="country__meta">
                    <span className="country__coords">{c.lat} · {c.lng}</span>
                    <span className="country__count" aria-label={`${c.providers} proveedores de demostración`}>
                      <span className="dots" aria-hidden="true">{Array.from({ length: c.providers }).map((_, k) => <i key={k} />)}</span>
                      {c.providers} {c.providers === 1 ? 'proveedor' : 'proveedores'} <small>(demo)</small>
                    </span>
                  </div>
                </>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* MARCAS */}
      <section className="section section--sand" id="marcas">
        <div className="container">
          <Reveal>
            <div className="section__head">
              <div>
                <p className="eyebrow">Marcas y tiendas de referencia</p>
                <h2 className="h2">Dónde podemos <em>buscar</em></h2>
              </div>
              <div className="section__aside section__aside--stack">
                <Tag tone="demo">Ejemplos demostrativos</Tag>
                <p>Referencias ilustrativas: no son alianzas, distribuidores autorizados ni relaciones verificadas. El propietario configurará las reales.</p>
              </div>
            </div>
          </Reveal>
          <ul className="brands">
            {PROVIDER_BRANDS.map((b, i) => (
              <Reveal as="li" key={b.id} delay={(i % 2) * 60} className="brandrow">
                <>
                  <span className="brandrow__idx">{String(i + 1).padStart(2, '0')}</span>
                  <div className="brandrow__name">
                    <span className="brandrow__word">{b.name}</span>
                    <span className="brandrow__kind">{b.kind} · ref. {COUNTRY_BY_ID[b.countryId]?.name}</span>
                  </div>
                  <p className="brandrow__desc">{b.description}</p>
                  <div className="brandrow__cats">
                    {b.categories.map((cid) => <span key={cid} className="chip chip--static">{CATEGORY_BY_ID[cid].short}</span>)}
                  </div>
                </>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="section" id="como-funciona">
        <div className="container">
          <Reveal>
            <p className="eyebrow">Cómo funciona</p>
            <h2 className="h2">Tres pasos, <em>sin pagos</em> aquí</h2>
          </Reveal>
          <ol className="steps">
            {[
              { n: '1', icon: <LuSearch />, t: 'Explora o describe', d: 'Recorre el catálogo o cuéntanos qué buscas, aunque no aparezca. Guarda tus favoritos mientras decides.' },
              { n: '2', icon: <LuCompass />, t: 'Solicita información', d: 'Prepara tu solicitud con los detalles que conozcas. Se guarda en tu navegador y genera un resumen para copiar.' },
              { n: '3', icon: <LuMessageCircle />, t: 'Coordina por Instagram', d: 'Continúas la conversación con nosotros por mensaje directo. Allí recibes la cotización y definimos los detalles.' },
            ].map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 90} className="step">
                <>
                  <span className="step__n" aria-hidden="true">{s.n}</span>
                  <span className="step__icon" aria-hidden="true">{s.icon}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </>
              </Reveal>
            ))}
          </ol>
          <p className="steps__note">No hay carrito, pagos ni confirmaciones de compra en esta plataforma. La disponibilidad y las condiciones se confirman por Instagram.</p>
        </div>
      </section>
    </>
  )
}

function FeaturedRail() {
  const ref = useRef<HTMLDivElement>(null)
  const featured = PRODUCTS.filter((p) => p.featured)
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: 'smooth' })
  return (
    <section className="section section--rail">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">Selección curada</p>
              <h2 className="h2">Productos que <em>inspiran</em></h2>
            </div>
            <div className="rail__controls">
              <button type="button" className="iconbtn iconbtn--outline" onClick={() => scroll(-1)} aria-label="Anterior"><LuArrowRight style={{ transform: 'rotate(180deg)' }} aria-hidden /></button>
              <button type="button" className="iconbtn iconbtn--outline" onClick={() => scroll(1)} aria-label="Siguiente"><LuArrowRight aria-hidden /></button>
              <Button href="/catalogo" variant="ghost" size="sm">Ver todo <LuArrowUpRight aria-hidden /></Button>
            </div>
          </div>
        </Reveal>
      </div>
      <div className="rail" ref={ref} tabIndex={0} aria-label="Productos destacados">
        <div className="rail__inner">
          {featured.map((p, i) => (
            <div className="rail__item" key={p.id}>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
