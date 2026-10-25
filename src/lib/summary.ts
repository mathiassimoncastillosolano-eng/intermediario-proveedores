import { CATEGORY_BY_ID } from '../data/categories'
import { COUNTRY_BY_ID } from '../data/countries'
import { INSTAGRAM_HANDLE } from '../config'
import type { Product, ProductRequest } from '../types'
import { formatDate } from './text'

/** Resúmenes para copiar. Nunca incluyen precios. */
export function productSummary(p: Product) {
  const lines = [
    `Hola ${INSTAGRAM_HANDLE}, quisiera consultar por este producto:`,
    '',
    `• Producto: ${p.name}`,
    `• Marca: ${p.brand}`,
    `• Modelo/referencia: ${p.model}`,
    `• Categoría: ${CATEGORY_BY_ID[p.categoryId]?.name ?? p.categoryId}`,
  ]
  if (p.countryId && COUNTRY_BY_ID[p.countryId]) lines.push(`• País de referencia: ${COUNTRY_BY_ID[p.countryId].name}`)
  if (p.specs.length) {
    lines.push('• Características:')
    p.specs.forEach(([k, v]) => lines.push(`   – ${k}: ${v}`))
  }
  lines.push('', '¿Podrían indicarme si es posible conseguirlo y cuáles son las condiciones?')
  return lines.join('\n')
}

export function requestSummary(r: ProductRequest) {
  const lines = [
    `Hola ${INSTAGRAM_HANDLE}, quiero solicitar un producto (ref. ${r.id}):`,
    '',
    `• Producto: ${r.name}`,
    `• Descripción: ${r.description}`,
    `• Categoría: ${r.category}`,
  ]
  if (r.brandModel) lines.push(`• Marca/modelo: ${r.brandModel}`)
  if (r.specs) lines.push(`• Características deseadas: ${r.specs}`)
  lines.push(`• Cantidad: ${r.quantity}`)
  if (r.market) lines.push(`• Mercado de referencia (preferencia de búsqueda): ${r.market}`)
  if (r.link) lines.push(`• Enlace de referencia: ${r.link}`)
  if (r.notes) lines.push(`• Observaciones: ${r.notes}`)
  lines.push('', `Creada el ${formatDate(r.createdAt)}. ¿Me pueden ayudar con la búsqueda y la cotización?`)
  return lines.join('\n')
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* continúa con el plan B */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
