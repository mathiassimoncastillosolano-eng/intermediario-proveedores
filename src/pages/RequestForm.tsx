import { useEffect, useMemo, useRef, useState } from 'react'
import { LuArrowRight, LuCheck, LuCopy, LuInfo, LuPlus, LuSearch, LuClipboardList } from 'react-icons/lu'
import { CATEGORIES } from '../data/categories'
import { COUNTRIES } from '../data/countries'
import { PRODUCT_BY_ID } from '../data/products'
import { INSTAGRAM_HANDLE } from '../config'
import type { ProductRequest } from '../types'
import { Link, type Route } from '../lib/router'
import { requestSummary } from '../lib/summary'
import { isValidHttpUrl } from '../lib/text'
import { useStore } from '../store'
import { Button, InstagramGlyph, Select, Stepper, TextField } from '../components/ui'

interface Form {
  name: string
  description: string
  category: string
  brandModel: string
  link: string
  market: string
  specs: string
  quantity: number
  notes: string
}

const EMPTY: Form = { name: '', description: '', category: '', brandModel: '', link: '', market: '', specs: '', quantity: 1, notes: '' }
type Errors = Partial<Record<keyof Form, string>>

const CATEGORY_OPTIONS = [...CATEGORIES.map((c) => ({ value: c.name, label: c.name })), { value: 'No estoy seguro', label: 'No estoy seguro' }]
const MARKET_OPTIONS = [
  { value: '', label: 'Sin preferencia', hint: 'Buscamos donde tenga más sentido' },
  ...COUNTRIES.map((c) => ({ value: c.name, label: c.name })),
  { value: 'Otro', label: 'Otro mercado' },
]

export function RequestPage({ route }: { route: Route }) {
  const { addRequest, openHandoff, copy, setRequestStatus } = useStore()
  const q = route.params.get('q') ?? ''
  const productId = route.params.get('producto') ?? ''
  const product = productId ? PRODUCT_BY_ID[productId] : undefined

  const initial = useMemo<{ form: Form; origin: string; originLabel: string }>(() => {
    if (product) {
      return {
        form: { ...EMPTY, name: product.name, brandModel: `${product.brand} ${product.model}`.trim(), category: CATEGORIES.find((c) => c.id === product.categoryId)?.name ?? '', description: `Me interesa este producto del catálogo: ${product.name} (${product.brand}, ref. ${product.model}).` },
        origin: `Producto del catálogo: ${product.name}`,
        originLabel: `Precargamos los datos de «${product.name}». Puedes editarlos antes de continuar.`,
      }
    }
    if (q) return { form: { ...EMPTY, name: q }, origin: `Búsqueda sin resultados: «${q}»`, originLabel: `Precargamos tu búsqueda «${q}». Cuéntanos más para ayudarte mejor.` }
    return { form: EMPTY, origin: 'Formulario directo', originLabel: '' }
  }, [q, product])

  const [form, setForm] = useState<Form>(initial.form)
  const [errors, setErrors] = useState<Errors>({})
  const [saved, setSaved] = useState<ProductRequest | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setForm(initial.form); setErrors({}); setSaved(null) }, [initial])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const validate = (): Errors => {
    const e: Errors = {}
    if (form.name.trim().length < 3) e.name = 'Escribe el nombre del producto (mínimo 3 caracteres).'
    if (form.description.trim().length < 10) e.description = 'Descríbelo con un poco más de detalle (mínimo 10 caracteres).'
    if (!form.category) e.category = 'Elige una categoría aproximada.'
    if (form.link.trim() && !isValidHttpUrl(form.link)) e.link = 'El enlace debe empezar con http:// o https://.'
    return e
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) {
      window.setTimeout(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], .field--error button')?.focus(), 30)
      return
    }
    const req = addRequest({ ...form, name: form.name.trim(), description: form.description.trim(), brandModel: form.brandModel.trim(), link: form.link.trim(), specs: form.specs.trim(), notes: form.notes.trim(), origin: initial.origin })
    setSaved(req)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (saved) {
    const summary = requestSummary(saved)
    return (
      <div className="container page">
        <div className="done">
          <div className="done__icon" aria-hidden="true"><LuCheck /></div>
          <p className="eyebrow">Solicitud guardada en este navegador</p>
          <h1 className="h1">Tu solicitud <em>{saved.id}</em> está lista</h1>
          <div className="notice notice--warn" role="note">
            <LuInfo aria-hidden />
            <p><strong>Aún no la hemos recibido.</strong> Guardarla en tu navegador no la envía al propietario. Para continuar, copia el resumen y pégalo en un mensaje directo a <strong>{INSTAGRAM_HANDLE}</strong>.</p>
          </div>
          <pre className="done__summary" tabIndex={0} aria-label="Resumen de la solicitud">{summary}</pre>
          <div className="done__actions">
            <Button variant="primary" size="lg" onClick={() => openHandoff({ title: `Continuar ${saved.id} en Instagram`, text: summary, onOpened: () => setRequestStatus(saved.id, 'iniciada') })}>
              <InstagramGlyph /> Continuar en Instagram
            </Button>
            <Button variant="outline" size="lg" onClick={() => copy(summary)}><LuCopy aria-hidden /> Copiar resumen</Button>
            <Button href="/solicitudes" variant="ghost" size="lg">Ver mis solicitudes <LuArrowRight aria-hidden /></Button>
          </div>
          <button type="button" className="linkbtn" onClick={() => { setSaved(null); setForm(EMPTY) }}><LuPlus aria-hidden /> Crear otra solicitud</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container page request">
      <aside className="request__intro">
        <p className="eyebrow">Solicitud de producto</p>
        <h1 className="h1">Cuéntanos qué <em>buscas</em></h1>
        <p className="lead">Aunque no esté en el catálogo, podemos intentar encontrarlo. Rellena lo que sepas; solo pedimos lo indispensable.</p>
        {initial.originLabel && (
          <div className="notice notice--em" role="status"><LuSearch aria-hidden /><p>{initial.originLabel}</p></div>
        )}
        <ol className="request__steps">
          <li><span>1</span> Describe el producto</li>
          <li><span>2</span> Guardamos tu solicitud en este navegador</li>
          <li><span>3</span> Copias el resumen y sigues por Instagram</li>
        </ol>
        <div className="notice" role="note">
          <LuInfo aria-hidden />
          <p>Esta plataforma no envía mensajes ni muestra precios. El país o mercado que indiques es una preferencia de búsqueda, no un destino de entrega garantizado.</p>
        </div>
      </aside>

      <form ref={formRef} className="request__form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Lo esencial</legend>
          <TextField label="Nombre del producto" value={form.name} onChange={(v) => set('name', v)} error={errors.name} placeholder="Ej.: Teclado mecánico 75 % inalámbrico" autoComplete="off" />
          <TextField label="Descripción" multiline rows={4} value={form.description} onChange={(v) => set('description', v)} error={errors.description} placeholder="Qué es, para qué lo quieres y qué es importante para ti" maxLength={800} />
          <div className="row2">
            <Select label="Categoría aproximada" value={form.category} onChange={(v) => set('category', v)} options={CATEGORY_OPTIONS} error={errors.category} />
            <TextField label="Marca o modelo" optional value={form.brandModel} onChange={(v) => set('brandModel', v)} placeholder="Si lo conoces" autoComplete="off" />
          </div>
        </fieldset>

        <fieldset>
          <legend>Más detalles <span>(opcional)</span></legend>
          <TextField label="Enlace de referencia" optional inputMode="url" type="url" value={form.link} onChange={(v) => set('link', v)} error={errors.link} placeholder="https://…" hint="Una página donde hayas visto el producto." />
          <div className="row2">
            <Select label="País o mercado de referencia" optional value={form.market} onChange={(v) => set('market', v)} options={MARKET_OPTIONS} hint="Preferencia de búsqueda, no destino de entrega." placeholder="Sin preferencia" />
            <Stepper label="Cantidad" value={form.quantity} onChange={(n) => set('quantity', n)} />
          </div>
          <TextField label="Especificaciones deseadas" optional multiline rows={3} value={form.specs} onChange={(v) => set('specs', v)} placeholder="Color, capacidad, tamaño, versión…" maxLength={500} />
          <TextField label="Observaciones adicionales" optional multiline rows={3} value={form.notes} onChange={(v) => set('notes', v)} placeholder="Cualquier cosa que debamos saber" maxLength={500} />
        </fieldset>

        <div className="request__submit">
          <Button variant="primary" size="lg" type="submit"><LuClipboardList aria-hidden /> Guardar solicitud</Button>
          <p>Se guarda solo en este navegador. Después podrás copiar el resumen y continuar por Instagram. <Link to="/ayuda">Más información</Link></p>
        </div>
      </form>
    </div>
  )
}
