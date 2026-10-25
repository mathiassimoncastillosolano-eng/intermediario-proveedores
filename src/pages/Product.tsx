import { useEffect, useState } from 'react'
import { LuArrowLeft, LuArrowRight, LuHeart, LuInfo, LuMapPin, LuPackageSearch } from 'react-icons/lu'
import { CATEGORY_BY_ID } from '../data/categories'
import { COUNTRY_BY_ID } from '../data/countries'
import { PRODUCT_BY_ID, PRODUCTS } from '../data/products'
import { buildHref, Link } from '../lib/router'
import { productSummary } from '../lib/summary'
import { useStore } from '../store'
import { ProductCard } from '../components/ProductCard'
import { Button, EmptyState, InstagramGlyph, ProductPlate, Tag } from '../components/ui'

export function ProductPage({ id }: { id: string }) {
  const { isFavorite, toggleFavorite, openHandoff } = useStore()
  const product = PRODUCT_BY_ID[id]
  const [view, setView] = useState(0)
  useEffect(() => setView(0), [id])

  if (!product) {
    return (
      <div className="container page">
        <EmptyState icon={<LuPackageSearch />} title="No encontramos este producto" actions={<><Button href="/catalogo" variant="ink">Volver al catálogo</Button><Button href="/solicitar" variant="outline">Solicitar un producto</Button></>}>
          Es posible que el enlace sea antiguo. Puedes explorar el catálogo o solicitarlo.
        </EmptyState>
      </div>
    )
  }

  const cat = CATEGORY_BY_ID[product.categoryId]
  const country = product.countryId ? COUNTRY_BY_ID[product.countryId] : undefined
  const fav = isFavorite(product.id)
  const related = PRODUCTS.filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .concat(PRODUCTS.filter((p) => p.categoryId !== product.categoryId && p.brand === product.brand && p.id !== product.id))
    .slice(0, 4)

  return (
    <div className="container page detail">
      <nav className="crumbs" aria-label="Ruta">
        <Link to="/catalogo" className="linkbtn"><LuArrowLeft aria-hidden /> Catálogo</Link>
        <span aria-hidden="true">/</span>
        <Link to={buildHref('/catalogo', { cat: cat.id })}>{cat.name}</Link>
      </nav>

      <div className="detail__grid">
        <div className="gallery">
          <div className="gallery__main">
            <ProductPlate key={view} product={product} variant={view} className="gallery__plate" />
          </div>
          <div className="gallery__thumbs" role="tablist" aria-label="Vistas del producto">
            {[0, 1, 2].map((v) => (
              <button key={v} type="button" role="tab" aria-selected={view === v} aria-label={`Vista ${v + 1}`} className={view === v ? 'is-on' : ''} onClick={() => setView(v)}>
                <ProductPlate product={product} variant={v} showLabel={false} />
              </button>
            ))}
          </div>
          <p className="gallery__note">Ilustración de referencia del catálogo de demostración. Las imágenes reales pueden diferir.</p>
        </div>

        <div className="detail__info">
          <div className="detail__tags">
            <Tag tone="accent">{cat.name}</Tag>
            <span className="detail__type">{product.type}</span>
          </div>
          <p className="detail__brand">{product.brand}</p>
          <h1 className="detail__name">{product.name}</h1>
          <p className="detail__model">Modelo / referencia: <strong>{product.model}</strong></p>
          <p className="detail__desc">{product.description}</p>

          {country && (
            <p className="detail__ref"><LuMapPin aria-hidden /> País de referencia del proveedor: <strong>{country.name}</strong> <small>(no indica destino de entrega)</small></p>
          )}

          <div className="detail__actions">
            <Button variant="primary" size="lg" onClick={() => openHandoff({ title: `Consultar: ${product.name}`, text: productSummary(product) })}>
              <InstagramGlyph /> Consultar por Instagram
            </Button>
            <Button href={buildHref('/solicitar', { producto: product.id })} variant="ink" size="lg">Iniciar solicitud <LuArrowRight aria-hidden /></Button>
            <button type="button" className={`btn btn--outline btn--lg favtoggle${fav ? ' is-on' : ''}`} aria-pressed={fav} onClick={() => toggleFavorite(product.id, product.name)}>
              <LuHeart aria-hidden /> {fav ? 'En favoritos' : 'Favorito'}
            </button>
          </div>

          <div className="notice" role="note">
            <LuInfo aria-hidden />
            <p>Este producto no tiene precio publicado ni disponibilidad confirmada. Lo consultamos y te respondemos por Instagram.</p>
          </div>

          <section className="specs" aria-labelledby="specs-h">
            <h2 id="specs-h" className="h4">Especificaciones</h2>
            <dl>
              {product.specs.map(([k, v]) => (
                <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
              ))}
              <div><dt>Tipo</dt><dd>{product.type}</dd></div>
            </dl>
            {product.tags.length > 0 && (
              <div className="specs__tags">
                {product.tags.map((t) => <Link key={t} to={buildHref('/catalogo', { cat: cat.id, tag: t })} className="chip">{t}</Link>)}
              </div>
            )}
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related" aria-labelledby="rel-h">
          <h2 id="rel-h" className="h2">También te puede <em>interesar</em></h2>
          <div className="grid grid--4">
            {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}
    </div>
  )
}
