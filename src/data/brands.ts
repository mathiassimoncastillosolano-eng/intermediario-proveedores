import type { ProviderBrand } from '../types'

/**
 * DATOS DE DEMOSTRACIÓN — ejemplos ilustrativos de marcas y tiendas donde se puede gestionar una búsqueda.
 * No representan alianzas, distribuidores autorizados ni relaciones verificadas.
 * El propietario debe reemplazar esta lista con sus marcas y tiendas reales.
 */
export const PROVIDER_BRANDS: ProviderBrand[] = [
  { id: 'amazon', name: 'Amazon', countryId: 'us', kind: 'Tienda', description: 'Marketplace generalista: tecnología, hogar, moda y libros.', categories: ['smartphones', 'computacion', 'otros'] },
  { id: 'apple', name: 'Apple', countryId: 'us', kind: 'Marca', description: 'Teléfonos, portátiles, relojes y accesorios del ecosistema.', categories: ['smartphones', 'computacion', 'audio'] },
  { id: 'samsung', name: 'Samsung', countryId: 'kr', kind: 'Marca', description: 'Smartphones, almacenamiento SSD y electrónica.', categories: ['smartphones', 'memoria'] },
  { id: 'newegg', name: 'Newegg', countryId: 'us', kind: 'Tienda', description: 'Componentes de PC, tarjetas gráficas, memorias y periféricos.', categories: ['componentes', 'memoria', 'gaming'] },
  { id: 'bh', name: 'B&H Photo Video', countryId: 'us', kind: 'Tienda', description: 'Cámaras, lentes, audio profesional y equipo de producción.', categories: ['fotografia', 'audio'] },
  { id: 'sony', name: 'Sony', countryId: 'jp', kind: 'Marca', description: 'Cámaras, audio y consolas de videojuegos.', categories: ['fotografia', 'audio', 'gaming'] },
  { id: 'sephora', name: 'Sephora', countryId: 'us', kind: 'Tienda', description: 'Maquillaje, cuidado de la piel y fragancias.', categories: ['belleza'] },
  { id: 'rakuten', name: 'Rakuten', countryId: 'jp', kind: 'Plataforma', description: 'Plataforma japonesa con electrónica, moda y coleccionables.', categories: ['moda', 'otros', 'fotografia'] },
  { id: 'aliexpress', name: 'AliExpress', countryId: 'cn', kind: 'Plataforma', description: 'Accesorios, periféricos y electrónica de consumo.', categories: ['componentes', 'otros'] },
  { id: 'zalando', name: 'Zalando', countryId: 'de', kind: 'Tienda', description: 'Moda y calzado de marcas europeas y deportivas.', categories: ['moda'] },
  { id: 'natura', name: 'Natura', countryId: 'br', kind: 'Marca', description: 'Cosmética y cuidado personal de origen brasileño.', categories: ['belleza'] },
  { id: 'wildberries', name: 'Wildberries', countryId: 'ru', kind: 'Plataforma', description: 'Plataforma regional con moda, hogar y electrónica.', categories: ['moda', 'otros'] },
]
