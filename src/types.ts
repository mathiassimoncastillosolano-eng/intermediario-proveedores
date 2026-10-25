export type CategoryId =
  | 'smartphones'
  | 'computacion'
  | 'componentes'
  | 'memoria'
  | 'gaming'
  | 'audio'
  | 'fotografia'
  | 'moda'
  | 'belleza'
  | 'otros'

export interface Category {
  id: CategoryId
  name: string
  short: string
  blurb: string
  bg: string
  fg: string
  accent: string
}

export interface Product {
  id: string
  name: string
  brand: string
  categoryId: CategoryId
  type: string
  model: string
  countryId?: string
  description: string
  specs: [string, string][]
  tags: string[]
  addedAt: string
  featured?: boolean
  /** URL opcional de fotografía real. Si falla, se muestra la ilustración de respaldo. */
  image?: string
  keywords?: string[]
}

export interface Country {
  id: string
  name: string
  code: string
  lat: string
  lng: string
  description: string
  providers: number
  tone: string
  ink: string
}

export interface ProviderBrand {
  id: string
  name: string
  countryId: string
  kind: 'Marca' | 'Tienda' | 'Plataforma'
  description: string
  categories: CategoryId[]
}

export type RequestStatus = 'pendiente' | 'iniciada' | 'cerrada'

export interface ProductRequest {
  id: string
  name: string
  description: string
  category: string
  brandModel: string
  link: string
  market: string
  specs: string
  quantity: number
  notes: string
  createdAt: string
  status: RequestStatus
  origin: string
}

export interface Session {
  name: string
  email: string
  demo: boolean
}

export interface Prefs {
  interests: CategoryId[]
}
