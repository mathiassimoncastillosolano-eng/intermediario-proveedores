import { CATEGORY_BY_ID } from '../data/categories'
import type { Product } from '../types'
import { normalize } from './text'

export interface Scored {
  product: Product
  score: number
}

/** Búsqueda por nombre, marca, modelo, categoría, tipo y palabras clave. Todas las palabras deben coincidir. */
export function searchProducts(list: Product[], query: string): Scored[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean)
  if (!tokens.length) return list.map((product) => ({ product, score: 0 }))
  const out: Scored[] = []
  for (const product of list) {
    const f = {
      name: normalize(product.name),
      brand: normalize(product.brand),
      model: normalize(product.model),
      cat: normalize(CATEGORY_BY_ID[product.categoryId]?.name ?? ''),
      type: normalize(product.type),
      extra: normalize([...(product.keywords ?? []), ...product.tags].join(' ')),
      desc: normalize(product.description + ' ' + product.specs.map((s) => s.join(' ')).join(' ')),
    }
    let total = 0
    let ok = true
    for (const t of tokens) {
      let s = 0
      if (f.name.includes(t)) s += 6
      if (f.brand.includes(t)) s += 5
      if (f.model.includes(t)) s += 5
      if (f.type.includes(t)) s += 4
      if (f.cat.includes(t)) s += 3
      if (f.extra.includes(t)) s += 3
      if (f.desc.includes(t)) s += 1
      if (!s) { ok = false; break }
      total += s
    }
    if (ok) out.push({ product, score: total })
  }
  return out
}
