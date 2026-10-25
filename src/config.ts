/**
 * Configuración central de la plataforma.
 * Cambia aquí el enlace de Instagram, el nombre de marca y las claves de almacenamiento.
 */
export const INSTAGRAM_URL = 'https://www.instagram.com/aka_dosa/'
export const INSTAGRAM_HANDLE = '@aka_dosa'

export const BRAND = {
  name: 'aka dosa',
  tagline: 'Búsqueda internacional',
}

export const STORAGE_PREFIX = 'akadosa:v1:'

export const STORAGE_KEYS = {
  session: 'session',
  favorites: 'favorites',
  requests: 'requests',
  prefs: 'prefs',
} as const

export const DEMO_ACCOUNT = {
  name: 'Cliente Demo',
  email: 'demo@akadosa.app',
  password: 'demo1234',
}

export const DELIVERY_NOTICE =
  'Estos países representan ubicaciones de nuestros proveedores y contactos comerciales. No indican destinos de entrega disponibles.'
