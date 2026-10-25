import { LuArrowUpRight } from 'react-icons/lu'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, DELIVERY_NOTICE } from '../config'
import { Link } from '../lib/router'
import { InstagramGlyph, Wordmark } from './ui'

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Wordmark light />
          <p className="footer__lead">Te ayudamos a iniciar la búsqueda de productos internacionales. La cotización y la coordinación ocurren por Instagram.</p>
          <a className="btn btn--light" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
            <InstagramGlyph /> {INSTAGRAM_HANDLE} <LuArrowUpRight aria-hidden />
          </a>
        </div>
        <nav aria-label="Pie de página" className="footer__nav">
          <p className="footer__h">Explorar</p>
          <Link to="/">Inicio</Link>
          <Link to="/catalogo">Catálogo</Link>
          <Link to="/solicitar">Solicitar un producto</Link>
          <Link to="/solicitudes">Mis solicitudes</Link>
          <Link to="/favoritos">Favoritos</Link>
        </nav>
        <nav aria-label="Información" className="footer__nav">
          <p className="footer__h">Información</p>
          <Link to="/ayuda">Preguntas frecuentes</Link>
          <Link to="/ayuda">Condiciones informativas</Link>
          <Link to="/perfil">Perfil</Link>
        </nav>
        <div className="footer__notes">
          <p className="footer__h">Antes de continuar</p>
          <p><strong>Precios coordinados directamente.</strong> Esta plataforma no muestra precios ni procesa compras o pagos; las condiciones se acuerdan por Instagram.</p>
          <p><strong>Países y entregas.</strong> {DELIVERY_NOTICE}</p>
        </div>
      </div>
      <div className="container footer__bar">
        <span>© {new Date().getFullYear()} aka dosa. Catálogo, marcas y países de ejemplo: datos de demostración.</span>
        <span>No es una tienda: es un servicio de búsqueda y solicitud.</span>
      </div>
    </footer>
  )
}
