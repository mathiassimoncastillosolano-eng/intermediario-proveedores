import { useState } from 'react'
import { LuArrowRight, LuClipboardList, LuCopy, LuHeart, LuLogOut, LuRotateCcw, LuTrash2, LuInfo, LuTriangleAlert } from 'react-icons/lu'
import { CATEGORIES } from '../data/categories'
import { PRODUCTS } from '../data/products'
import { DEMO_ACCOUNT, INSTAGRAM_HANDLE } from '../config'
import { Link } from '../lib/router'
import { requestSummary } from '../lib/summary'
import { formatDate, initials } from '../lib/text'
import { useStore } from '../store'
import type { RequestStatus } from '../types'
import { ProductCard } from '../components/ProductCard'
import { Accordion, Button, EmptyState, InstagramGlyph, Modal, Select, Tag, TextField } from '../components/ui'

const STATUS: { value: RequestStatus; label: string; hint: string }[] = [
  { value: 'pendiente', label: 'Pendiente de contacto', hint: 'Aún no escribes por Instagram' },
  { value: 'iniciada', label: 'Consulta iniciada', hint: 'Ya abriste la conversación' },
  { value: 'cerrada', label: 'Cerrada', hint: 'Ya no necesitas seguimiento' },
]

/* ---------------- Mis solicitudes ---------------- */
export function RequestsPage() {
  const { requests, setRequestStatus, removeRequest, openHandoff, copy, storageOk } = useStore()
  const [toDelete, setToDelete] = useState<string | null>(null)

  return (
    <div className="container page">
      <header className="pagehead">
        <div>
          <p className="eyebrow">Mis solicitudes</p>
          <h1 className="h1">Lo que has <em>pedido</em></h1>
        </div>
        <Button href="/solicitar" variant="primary"><LuClipboardList aria-hidden /> Nueva solicitud</Button>
      </header>

      <div className="notice" role="note">
        <LuInfo aria-hidden />
        <p>
          Estas solicitudes viven <strong>solo en este navegador</strong>: si borras los datos del sitio o cambias de dispositivo, desaparecen. Que aparezcan aquí no significa que el propietario las haya recibido. Los estados son tuyos, no actualizaciones del negocio.
          {!storageOk && <> <strong>Ojo:</strong> tu navegador bloquea el almacenamiento local; se conservarán únicamente mientras esta pestaña siga abierta.</>}
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={<LuClipboardList />} title="Aún no tienes solicitudes" actions={<><Button href="/solicitar" variant="primary" size="lg">Solicitar un producto <LuArrowRight aria-hidden /></Button><Button href="/catalogo" variant="outline" size="lg">Explorar el catálogo</Button></>}>
          Cuando guardes una solicitud, la verás aquí con su resumen listo para copiar.
        </EmptyState>
      ) : (
        <ul className="reqlist">
          {requests.map((r) => {
            const summary = requestSummary(r)
            return (
              <li key={r.id} className={`req req--${r.status}`}>
                <div className="req__top">
                  <div>
                    <p className="req__id">{r.id}</p>
                    <h2 className="req__name">{r.name}</h2>
                    <p className="req__date">Creada el {formatDate(r.createdAt)} · {r.origin}</p>
                  </div>
                  <div className="req__status">
                    <Select label="Estado local" hideLabel compact value={r.status} onChange={(v) => setRequestStatus(r.id, v as RequestStatus)} options={STATUS} />
                  </div>
                </div>
                <dl className="req__data">
                  <div><dt>Categoría</dt><dd>{r.category}</dd></div>
                  {r.brandModel && <div><dt>Marca / modelo</dt><dd>{r.brandModel}</dd></div>}
                  <div><dt>Cantidad</dt><dd>{r.quantity}</dd></div>
                  {r.market && <div><dt>Mercado de referencia</dt><dd>{r.market}</dd></div>}
                  <div className="wide"><dt>Descripción</dt><dd>{r.description}</dd></div>
                  {r.specs && <div className="wide"><dt>Características</dt><dd>{r.specs}</dd></div>}
                  {r.link && <div className="wide"><dt>Enlace</dt><dd><a href={r.link} target="_blank" rel="noopener noreferrer">{r.link}</a></dd></div>}
                  {r.notes && <div className="wide"><dt>Observaciones</dt><dd>{r.notes}</dd></div>}
                </dl>
                <div className="req__actions">
                  <Button variant="primary" onClick={() => openHandoff({ title: `Continuar ${r.id} en Instagram`, text: summary, onOpened: () => r.status === 'pendiente' && setRequestStatus(r.id, 'iniciada') })}>
                    <InstagramGlyph /> Continuar en Instagram
                  </Button>
                  <Button variant="outline" onClick={() => copy(summary)}><LuCopy aria-hidden /> Copiar resumen</Button>
                  <Button variant="ghost" onClick={() => setToDelete(r.id)} aria-label={`Eliminar solicitud ${r.id}`}><LuTrash2 aria-hidden /> Eliminar</Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="¿Eliminar esta solicitud?" variant="center">
        <p className="confirm__text">Se borrará de este navegador. No afecta a ninguna conversación que ya tengas en Instagram.</p>
        <div className="confirm__actions">
          <Button variant="outline" onClick={() => setToDelete(null)}>Cancelar</Button>
          <Button variant="ink" onClick={() => { if (toDelete) removeRequest(toDelete); setToDelete(null) }}><LuTrash2 aria-hidden /> Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}

/* ---------------- Favoritos ---------------- */
export function FavoritesPage() {
  const { favorites } = useStore()
  const items = favorites.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as typeof PRODUCTS
  return (
    <div className="container page">
      <header className="pagehead">
        <div>
          <p className="eyebrow">Favoritos</p>
          <h1 className="h1">Tu <em>selección</em></h1>
        </div>
        {items.length > 0 && <p className="pagehead__count">{items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}</p>}
      </header>
      {items.length === 0 ? (
        <EmptyState icon={<LuHeart />} title="Todavía no tienes favoritos" actions={<Button href="/catalogo" variant="primary" size="lg">Explorar el catálogo <LuArrowRight aria-hidden /></Button>}>
          Toca el corazón en cualquier producto para guardarlo aquí y consultarlo cuando quieras.
        </EmptyState>
      ) : (
        <div className="grid">
          {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}

/* ---------------- Perfil ---------------- */
export function ProfilePage() {
  const { session, updateName, favorites, requests, prefs, toggleInterest, logout, resetDemo, storageOk } = useStore()
  const [name, setName] = useState(session?.name ?? '')
  const [confirm, setConfirm] = useState(false)
  if (!session) return null

  return (
    <div className="container page profile">
      <header className="pagehead">
        <div>
          <p className="eyebrow">Perfil del cliente</p>
          <h1 className="h1">Tu <em>cuenta</em></h1>
        </div>
        {session.demo && <Tag tone="demo">Cuenta de demostración</Tag>}
      </header>

      <div className="profile__grid">
        <section className="panel profile__id">
          <div className="profile__avatar" aria-hidden="true">{initials(session.name)}</div>
          <div>
            <h2 className="h3">{session.name}</h2>
            <p className="muted">{session.email}</p>
          </div>
          <form className="profile__form" onSubmit={(e) => { e.preventDefault(); updateName(name) }}>
            <TextField label="Nombre" value={name} onChange={setName} autoComplete="name" />
            <Button variant="outline" type="submit" disabled={!name.trim() || name.trim() === session.name}>Guardar nombre</Button>
          </form>
        </section>

        <section className="panel">
          <h2 className="h4">Accesos rápidos</h2>
          <div className="shortcuts">
            <Link to="/favoritos" className="shortcut"><LuHeart aria-hidden /><span><strong>{favorites.length}</strong> favoritos</span><LuArrowRight aria-hidden /></Link>
            <Link to="/solicitudes" className="shortcut"><LuClipboardList aria-hidden /><span><strong>{requests.length}</strong> solicitudes</span><LuArrowRight aria-hidden /></Link>
            <Link to="/ayuda" className="shortcut"><LuInfo aria-hidden /><span>Preguntas frecuentes</span><LuArrowRight aria-hidden /></Link>
          </div>
        </section>

        <section className="panel profile__wide">
          <h2 className="h4">Categorías de interés</h2>
          <p className="muted">Solo para ti: las usamos para recordarte lo que más te interesa. No se comparten.</p>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className={`chip chip--lg${prefs.interests.includes(c.id) ? ' is-on' : ''}`} aria-pressed={prefs.interests.includes(c.id)} onClick={() => toggleInterest(c.id)}>{c.name}</button>
            ))}
          </div>
        </section>

        <section className="panel profile__wide profile__data">
          <div>
            <h2 className="h4">Datos de este navegador</h2>
            <p className="muted">
              Tus favoritos, solicitudes y sesión se guardan localmente. No hay servidor ni cuenta real; las contraseñas nunca se almacenan.
              {!storageOk && ' Tu navegador está bloqueando el almacenamiento local, así que algunos datos solo duran mientras la pestaña siga abierta.'}
            </p>
            {session.demo && <p className="muted">Credenciales de la cuenta demo: <code>{DEMO_ACCOUNT.email}</code></p>}
          </div>
          <div className="profile__buttons">
            <Button variant="outline" onClick={() => setConfirm(true)}><LuRotateCcw aria-hidden /> Restablecer datos de demostración</Button>
            <Button variant="ink" onClick={logout}><LuLogOut aria-hidden /> Cerrar sesión</Button>
          </div>
        </section>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="¿Restablecer los datos de demostración?" variant="center">
        <p className="confirm__text"><LuTriangleAlert aria-hidden /> Se borrarán tus favoritos, solicitudes, preferencias y la sesión de este navegador, y volverás a la pantalla de acceso.</p>
        <div className="confirm__actions">
          <Button variant="outline" onClick={() => setConfirm(false)}>Cancelar</Button>
          <Button variant="ink" onClick={() => { setConfirm(false); resetDemo() }}>Restablecer</Button>
        </div>
      </Modal>
    </div>
  )
}

/* ---------------- Preguntas frecuentes ---------------- */
export function FaqPage() {
  return (
    <div className="container page faq">
      <header className="pagehead">
        <div>
          <p className="eyebrow">Ayuda</p>
          <h1 className="h1">Preguntas <em>frecuentes</em></h1>
        </div>
      </header>
      <div className="faq__grid">
        <Accordion
          items={[
            { q: '¿Aquí puedo comprar productos?', a: <p>No. Esta plataforma no tiene carrito, pagos ni confirmaciones de compra. Sirve para explorar, guardar favoritos y preparar solicitudes. La compra, si procede, se coordina directamente por Instagram.</p> },
            { q: '¿Por qué no se muestran precios?', a: <p>Porque los precios, la disponibilidad definitiva y las condiciones se comunican directamente a cada cliente por Instagram (<strong>{INSTAGRAM_HANDLE}</strong>).</p> },
            { q: '¿Qué significan los países que aparecen en el inicio?', a: <p>Son ubicaciones donde existen proveedores o contactos comerciales de referencia (en esta versión, datos de demostración). <strong>No indican destinos de entrega</strong> ni cobertura logística, y no sirven para filtrar el catálogo.</p> },
            { q: '¿Las marcas y tiendas mostradas son socios oficiales?', a: <p>No. Son ejemplos ilustrativos de dónde se puede gestionar una búsqueda. No representan alianzas, distribuidores autorizados ni relaciones verificadas.</p> },
            { q: '¿Cuando guardo una solicitud, ya la recibió el propietario?', a: <p>No. Se guarda únicamente en tu navegador. Para continuar, copia el resumen y envíalo por mensaje directo en Instagram. La plataforma no envía mensajes automáticamente.</p> },
            { q: '¿Se puede precargar el mensaje en Instagram?', a: <p>No podemos garantizarlo. Por eso preparamos un resumen que copias y pegas tú mismo en la conversación.</p> },
            { q: '¿Qué pasa con mis datos?', a: <p>Tu sesión, favoritos y solicitudes se guardan en el almacenamiento local de este navegador. No hay base de datos ni servidor, y nunca se guardan contraseñas. Desde tu perfil puedes restablecerlo todo.</p> },
          ]}
        />
        <aside className="panel faq__aside">
          <h2 className="h4">Condiciones informativas</h2>
          <ul>
            <li>El catálogo es referencial; los productos y especificaciones pueden variar.</li>
            <li>La disponibilidad, el precio y los tiempos se confirman únicamente por Instagram.</li>
            <li>Un producto del catálogo no implica que esté disponible ni que se garantice su importación.</li>
            <li>El país o mercado indicado en una solicitud es una preferencia de búsqueda, no un destino de entrega.</li>
          </ul>
          <Button href="/solicitar" variant="primary">Solicitar un producto <LuArrowRight aria-hidden /></Button>
        </aside>
      </div>
    </div>
  )
}
