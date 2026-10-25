import type { Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'smartphones', name: 'Smartphones', short: 'Teléfonos', blurb: 'Teléfonos de última generación', bg: '#DCE9E2', fg: '#0E4535', accent: '#176B52' },
  { id: 'computacion', name: 'Computación', short: 'Computación', blurb: 'Portátiles y equipos de escritorio', bg: '#E6E4DC', fg: '#2B2B27', accent: '#4D4D45' },
  { id: 'componentes', name: 'Componentes de PC', short: 'Componentes', blurb: 'Tarjetas gráficas, periféricos y más', bg: '#1F2A26', fg: '#CFE5DB', accent: '#5FB596' },
  { id: 'memoria', name: 'RAM y almacenamiento', short: 'RAM y SSD', blurb: 'Memorias, SSD y unidades', bg: '#F0E6D6', fg: '#4A3A22', accent: '#9A7437' },
  { id: 'gaming', name: 'Gaming', short: 'Gaming', blurb: 'Consolas, mandos y portátiles de juego', bg: '#171717', fg: '#E8F4EE', accent: '#3FA37F' },
  { id: 'audio', name: 'Audio y bocinas', short: 'Audio', blurb: 'Auriculares y bocinas', bg: '#E9DDD3', fg: '#47301F', accent: '#A25A2C' },
  { id: 'fotografia', name: 'Fotografía', short: 'Fotografía', blurb: 'Cámaras y acción', bg: '#D9DEE6', fg: '#1D2A3E', accent: '#41567D' },
  { id: 'moda', name: 'Ropa y accesorios', short: 'Moda', blurb: 'Calzado, prendas y complementos', bg: '#EFE0DA', fg: '#4A241A', accent: '#A8503B' },
  { id: 'belleza', name: 'Maquillaje y belleza', short: 'Belleza', blurb: 'Maquillaje y cuidado personal', bg: '#F1DDE0', fg: '#4D1E2B', accent: '#B04865' },
  { id: 'otros', name: 'Otros productos', short: 'Otros', blurb: 'Todo lo que se te ocurra', bg: '#EAEAE7', fg: '#2B2B2B', accent: '#6B6B6B' },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<string, Category>
