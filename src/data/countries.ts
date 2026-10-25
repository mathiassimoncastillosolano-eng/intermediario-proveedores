import type { Country } from '../types'

/**
 * DATOS DE DEMOSTRACIÓN — sustituir por los países reales del negocio.
 * Un país aquí significa únicamente que hay un proveedor o contacto comercial allí.
 * No implica entregas ni cobertura logística.
 */
export const COUNTRIES: Country[] = [
  { id: 'us', name: 'Estados Unidos', code: 'US', lat: '38.9° N', lng: '77.0° O', description: 'Tecnología, componentes, moda y belleza. El punto de partida de la mayor parte de las búsquedas.', providers: 6, tone: '#DCE9E2', ink: '#0E4535' },
  { id: 'br', name: 'Brasil', code: 'BR', lat: '15.8° S', lng: '47.9° O', description: 'Cosmética, cuidado personal y moda de marcas sudamericanas.', providers: 2, tone: '#F3E7C7', ink: '#4B3A0C' },
  { id: 'ru', name: 'Rusia', code: 'RU', lat: '55.7° N', lng: '37.6° E', description: 'Plataformas de comercio electrónico regionales y electrónica.', providers: 1, tone: '#E1E4EC', ink: '#1D2A3E' },
  { id: 'cn', name: 'China', code: 'CN', lat: '39.9° N', lng: '116.4° E', description: 'Electrónica de consumo, periféricos y accesorios.', providers: 4, tone: '#EFD9D2', ink: '#4A1D14' },
  { id: 'jp', name: 'Japón', code: 'JP', lat: '35.7° N', lng: '139.7° E', description: 'Fotografía, consolas, audio y moda de autor.', providers: 3, tone: '#F1DDE0', ink: '#4D1E2B' },
  { id: 'kr', name: 'Corea del Sur', code: 'KR', lat: '37.6° N', lng: '127.0° E', description: 'Smartphones, memorias y almacenamiento.', providers: 2, tone: '#DDE6EE', ink: '#16324A' },
  { id: 'de', name: 'Alemania', code: 'DE', lat: '52.5° N', lng: '13.4° E', description: 'Moda deportiva, audio y equipamiento técnico.', providers: 2, tone: '#E6E4DC', ink: '#2B2B27' },
]

export const COUNTRY_BY_ID = Object.fromEntries(COUNTRIES.map((c) => [c.id, c])) as Record<string, Country>
