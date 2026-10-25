import { LuArrowUpRight, LuHeart, LuMapPin } from 'react-icons/lu'
import type { Product } from '../types'
import { CATEGORY_BY_ID } from '../data/categories'
import { COUNTRY_BY_ID } from '../data/countries'
import { Link } from '../lib/router'
import { productSummary } from '../lib/summary'
import { useStore } from '../store'
import { InstagramGlyph, ProductPlate } from './ui'

export function ProductCard({ product, index = 0, showCountry = true }: { product: Product; index?: number; showCountry?: boolean }) {
  const { isFavorite, toggleFavorite, openHandoff } = useStore()
  const fav = isFavorite(product.id)
  const cat = CATEGORY_BY_ID[product.categoryId]
  const country = product.countryId ? COUNTRY_BY_ID[product.countryId] : undefined
  const variant = index % 3

  return (
    <article className="card">
      <div className="card__media">
        <Link to={`/producto/${product.id}`} tabIndex={-1} aria-hidden="true">
          <ProductPlate product={product} variant={variant} />
        </Link>
        <button
          type="button"
          className={`favbtn${fav ? ' is-on' : ''}`}
          aria-pressed={fav}
          aria-label={fav ? `Quitar ${product.name} de favoritos` : `Añadir ${product.name} a favoritos`}
          onClick={() => toggleFavorite(product.id, product.name)}
        >
          <LuHeart aria-hidden />
        </button>
        <span className="card__cat">{cat.short}</span>
      </div>
      <div className="card__body">
        <p className="card__brand">{product.brand}</p>
        <h3 className="card__name">
          <Link to={`/producto/${product.id}`}>{product.name}</Link>
        </h3>
        {showCountry && country && (
          <p className="card__ref"><LuMapPin aria-hidden /> Ref. proveedor: {country.name}</p>
        )}
        <div className="card__actions">
          <Link to={`/producto/${product.id}`} className="linkbtn">
            Ver detalle <LuArrowUpRight aria-hidden />
          </Link>
          <button
            type="button"
            className="linkbtn linkbtn--em"
            onClick={() => openHandoff({ title: `Consultar: ${product.name}`, text: productSummary(product) })}
            aria-label={`Consultar ${product.name} por Instagram`}
          >
            <InstagramGlyph size={15} /> Consultar
          </button>
        </div>
      </div>
    </article>
  )
}
