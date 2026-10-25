import { useEffect, useRef } from 'react'
import { useRoute, navigate } from './lib/router'
import { useStore } from './store'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { LoginPage } from './pages/Login'
import { HomePage } from './pages/Home'
import { CatalogPage } from './pages/Catalog'
import { ProductPage } from './pages/Product'
import { RequestPage } from './pages/RequestForm'
import { FavoritesPage, FaqPage, ProfilePage, RequestsPage } from './pages/Account'
import { EmptyState, Button } from './components/ui'
import { LuCompass } from 'react-icons/lu'

export function App() {
  const route = useRoute()
  const { session } = useStore()
  const { path } = route
  const prev = useRef(path)

  // Guardas de sesión
  useEffect(() => {
    if (!session && path !== '/login') navigate('/login', { replace: true })
    if (session && path === '/login') navigate('/', { replace: true })
  }, [session, path])

  // Scroll al inicio al cambiar de página (no al cambiar filtros)
  useEffect(() => {
    if (prev.current !== path) window.scrollTo({ top: 0 })
    prev.current = path
    document.title = TITLES[path] ? `${TITLES[path]} · aka dosa` : path.startsWith('/producto') ? 'Producto · aka dosa' : 'aka dosa — Productos internacionales'
  }, [path])

  if (!session) return <LoginPage />
  if (path === '/login') return null

  let page
  if (path === '/') page = <HomePage />
  else if (path === '/catalogo') page = <CatalogPage route={route} />
  else if (path.startsWith('/producto/')) page = <ProductPage id={decodeURIComponent(path.slice('/producto/'.length))} />
  else if (path === '/solicitar') page = <RequestPage route={route} />
  else if (path === '/solicitudes') page = <RequestsPage />
  else if (path === '/favoritos') page = <FavoritesPage />
  else if (path === '/perfil') page = <ProfilePage />
  else if (path === '/ayuda') page = <FaqPage />
  else
    page = (
      <div className="container page">
        <EmptyState icon={<LuCompass />} title="Esta página no existe" actions={<Button href="/" variant="ink">Volver al inicio</Button>}>
          Revisa el enlace o vuelve al inicio.
        </EmptyState>
      </div>
    )

  return (
    <>
      <a href="#main" className="skip" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>Saltar al contenido</a>
      <Header path={path} />
      <main id="main" tabIndex={-1} key={path.startsWith('/producto') ? path : path} className="main page-enter">
        {page}
      </main>
      <Footer />
    </>
  )
}

const TITLES: Record<string, string> = {
  '/': 'Inicio',
  '/catalogo': 'Catálogo',
  '/solicitar': 'Solicitar un producto',
  '/solicitudes': 'Mis solicitudes',
  '/favoritos': 'Favoritos',
  '/perfil': 'Perfil',
  '/ayuda': 'Preguntas frecuentes',
}
