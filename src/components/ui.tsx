import {
  useCallback, useEffect, useId, useRef, useState,
  type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react'
import type { IconType } from 'react-icons'
import {
  LuCamera, LuChevronDown, LuCheck, LuCpu, LuEye, LuEyeOff, LuGamepad2, LuMemoryStick, LuMinus, LuPackage, LuPlus,
  LuShirt, LuSmartphone, LuLaptop, LuSparkles, LuSpeaker, LuX,
} from 'react-icons/lu'
import type { CategoryId, Product } from '../types'
import { CATEGORY_BY_ID } from '../data/categories'
import { hashString } from '../lib/text'

/* ------------------------------------------------------------------ */
/* Iconos y marca                                                      */
/* ------------------------------------------------------------------ */

export const CATEGORY_ICON: Record<CategoryId, IconType> = {
  smartphones: LuSmartphone,
  computacion: LuLaptop,
  componentes: LuCpu,
  memoria: LuMemoryStick,
  gaming: LuGamepad2,
  audio: LuSpeaker,
  fotografia: LuCamera,
  moda: LuShirt,
  belleza: LuSparkles,
  otros: LuPackage,
}

export function InstagramGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 16h28M16 2c5 4 7.5 9 7.5 14S21 26 16 30c-5-4-7.5-9-7.5-14S11 6 16 2Z" fill="none" stroke="currentColor" strokeWidth="1" opacity=".55" />
      <circle cx="23.6" cy="8.4" r="3.2" fill="var(--em)" />
    </svg>
  )
}

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`wordmark${light ? ' wordmark--light' : ''}`}>
      <BrandMark />
      <span className="wordmark__text"><i>aka</i> dosa</span>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Botones                                                             */
/* ------------------------------------------------------------------ */

type BtnVariant = 'primary' | 'ink' | 'outline' | 'ghost' | 'light'

interface BtnProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: BtnVariant
  size?: 'md' | 'lg' | 'sm'
  href?: string
  className?: string
  block?: boolean
}

export function Button({ variant = 'ink', size = 'md', href, className = '', block, children, ...rest }: BtnProps) {
  const cls = `btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`
  if (href) {
    return (
      <a className={cls} href={'#' + href}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  )
}

export function IconButton({ label, children, className = '', ...rest }: { label: string; children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`iconbtn ${className}`} aria-label={label} title={label} {...rest}>
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Campos                                                              */
/* ------------------------------------------------------------------ */

interface FieldBase {
  label: string
  error?: string
  hint?: string
  optional?: boolean
}

export function TextField({
  label, error, hint, optional, value, onChange, type = 'text', placeholder, multiline, rows = 4, name, autoComplete, inputMode, maxLength, right, id: idProp, autoFocus,
}: FieldBase & {
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  multiline?: boolean
  rows?: number
  name?: string
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'url' | 'numeric' | 'search'
  maxLength?: number
  right?: ReactNode
  id?: string
  autoFocus?: boolean
}) {
  const auto = useId()
  const id = idProp ?? auto
  const describedBy = `${id}-msg`
  const common = {
    id, name, value, placeholder, autoComplete, maxLength, autoFocus,
    'aria-invalid': !!error,
    'aria-describedby': describedBy,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
  }
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__opt">opcional</span>}
      </label>
      <div className="field__control">
        {multiline ? <textarea rows={rows} {...common} /> : <input type={type} inputMode={inputMode} {...common} />}
        {right && <div className="field__right">{right}</div>}
        <span className="field__line" aria-hidden="true" />
      </div>
      <p id={describedBy} className={`field__msg${error ? ' is-error' : ''}`} aria-live="polite">
        {error || hint || ' '}
      </p>
    </div>
  )
}

export function PasswordField(props: Omit<Parameters<typeof TextField>[0], 'type' | 'right'>) {
  const [show, setShow] = useState(false)
  return (
    <TextField
      {...props}
      type={show ? 'text' : 'password'}
      right={
        <button type="button" className="field__toggle" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={show}>
          {show ? <LuEyeOff aria-hidden /> : <LuEye aria-hidden />}
        </button>
      }
    />
  )
}

export interface Option {
  value: string
  label: string
  hint?: string
}

export function Select({
  label, value, onChange, options, placeholder = 'Selecciona…', error, hint, optional, compact, hideLabel,
}: FieldBase & {
  value: string
  onChange: (v: string) => void
  options: Option[]
  placeholder?: string
  compact?: boolean
  hideLabel?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const btn = useRef<HTMLButtonElement>(null)
  const selectedIndex = options.findIndex((o) => o.value === value)
  const selected = options[selectedIndex]

  useEffect(() => {
    if (!open) return
    const on = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', on)
    return () => document.removeEventListener('mousedown', on)
  }, [open])

  const openMenu = () => {
    setActive(Math.max(0, selectedIndex))
    setOpen(true)
  }
  const choose = (i: number) => {
    onChange(options[i].value)
    setOpen(false)
    btn.current?.focus()
  }

  const onKey = (e: ReactKeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openMenu()
      }
      return
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(0, a - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active) }
    else if (e.key === 'Tab') setOpen(false)
    else if (e.key.length === 1) {
      const i = options.findIndex((o) => o.label.toLowerCase().startsWith(e.key.toLowerCase()))
      if (i >= 0) setActive(i)
    }
  }

  return (
    <div className={`field select${error ? ' field--error' : ''}${compact ? ' select--compact' : ''}`} ref={root}>
      <span className={`field__label${hideLabel ? ' sr-only' : ''}`} id={`${id}-label`}>
        {label}
        {optional && <span className="field__opt">opcional</span>}
      </span>
      <button
        ref={btn}
        type="button"
        className={`select__btn${open ? ' is-open' : ''}${selected ? '' : ' is-placeholder'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-btn`}
        id={`${id}-btn`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKey}
      >
        <span className="select__value">{selected?.label ?? placeholder}</span>
        <LuChevronDown aria-hidden className="select__chev" />
      </button>
      {open && (
        <ul className="select__menu" role="listbox" aria-labelledby={`${id}-label`} tabIndex={-1} aria-activedescendant={`${id}-o${active}`}>
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${id}-o${i}`}
              role="option"
              aria-selected={o.value === value}
              className={`select__opt${i === active ? ' is-active' : ''}${o.value === value ? ' is-selected' : ''}`}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); choose(i) }}
            >
              <span>
                {o.label}
                {o.hint && <small>{o.hint}</small>}
              </span>
              {o.value === value && <LuCheck aria-hidden />}
            </li>
          ))}
        </ul>
      )}
      {!compact && (
        <p className={`field__msg${error ? ' is-error' : ''}`} aria-live="polite">
          {error || hint || ' '}
        </p>
      )}
    </div>
  )
}

export function Stepper({ label, value, onChange, min = 1, max = 99 }: { label: string; value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  return (
    <div className="field">
      <span className="field__label">{label}</span>
      <div className="stepper" role="group" aria-label={label}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Disminuir cantidad"><LuMinus aria-hidden /></button>
        <output aria-live="polite">{value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Aumentar cantidad"><LuPlus aria-hidden /></button>
      </div>
      <p className="field__msg">{' '}</p>
    </div>
  )
}

export function Checkbox({ checked, onChange, label, count }: { checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} className={`check${checked ? ' is-on' : ''}`} onClick={onChange}>
      <span className="check__box" aria-hidden="true">{checked && <LuCheck />}</span>
      <span className="check__label">{label}</span>
      {typeof count === 'number' && <span className="check__count">{count}</span>}
    </button>
  )
}

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  const idx = options.findIndex((o) => o.value === value)
  return (
    <div className="segmented" role="tablist" aria-label={label} style={{ '--n': options.length, '--i': idx } as CSSProperties}>
      <span className="segmented__thumb" aria-hidden="true" />
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value} className={o.value === value ? 'is-on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal / Drawer                                                      */
/* ------------------------------------------------------------------ */

export function Modal({
  open, onClose, title, children, variant = 'center', labelledBy, hideTitle,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  variant?: 'center' | 'side' | 'sheet' | 'top'
  labelledBy?: string
  hideTitle?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const last = useRef<HTMLElement | null>(null)
  const autoId = useId()
  const tid = labelledBy ?? autoId

  useEffect(() => {
    if (!open) return
    last.current = document.activeElement as HTMLElement | null
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = window.setTimeout(() => {
      const first = ref.current?.querySelector<HTMLElement>('[data-autofocus], input, textarea, button:not([data-close])')
      ;(first ?? ref.current)?.focus()
    }, 30)
    return () => {
      window.clearTimeout(t)
      document.body.style.overflow = prev
      last.current?.focus?.()
    }
  }, [open])

  const onKey = useCallback(
    (e: ReactKeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (e.key !== 'Tab') return
      const f = ref.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])')
      if (!f || !f.length) return
      const first = f[0], lastEl = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus() }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus() }
    },
    [onClose],
  )

  if (!open) return null
  return (
    <div className={`overlay overlay--${variant}`} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div ref={ref} className={`dialog dialog--${variant}`} role="dialog" aria-modal="true" aria-labelledby={tid} tabIndex={-1} onKeyDown={onKey}>
        <div className="dialog__head">
          <h2 id={tid} className={hideTitle ? 'sr-only' : 'dialog__title'}>{title}</h2>
          <IconButton label="Cerrar" onClick={onClose} data-close="" className="dialog__close"><LuX aria-hidden /></IconButton>
        </div>
        <div className="dialog__body">{children}</div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Revelado al hacer scroll                                            */
/* ------------------------------------------------------------------ */

export function Reveal({ children, delay = 0, className = '', as = 'div' }: { children: ReactNode; delay?: number; className?: string; as?: 'div' | 'li' }) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null)
  const Tag = as as 'div'
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return }
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref} className={`reveal${seen ? ' is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------------ */
/* Imagen de producto con respaldo                                     */
/* ------------------------------------------------------------------ */

export function ProductPlate({ product, variant = 0, className = '', showLabel = true }: { product: Pick<Product, 'id' | 'name' | 'brand' | 'model' | 'categoryId' | 'image'>; variant?: number; className?: string; showLabel?: boolean }) {
  const cat = CATEGORY_BY_ID[product.categoryId]
  const Icon = CATEGORY_ICON[product.categoryId]
  const seed = hashString(product.id)
  const [state, setState] = useState<'idle' | 'loaded' | 'failed'>(product.image ? 'idle' : 'failed')
  const v = variant % 3
  const cx = 230 + (seed % 90)
  const cy = 150 + ((seed >> 3) % 80)
  const rot = ((seed >> 5) % 30) - 15

  useEffect(() => { setState(product.image ? 'idle' : 'failed') }, [product.image])

  return (
    <div
      className={`plate ${className}`}
      style={{ background: cat.bg, color: cat.fg, '--accent': cat.accent } as CSSProperties}
      data-loading={state === 'idle'}
    >
      <svg className="plate__art" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {v === 0 && (
          <>
            <circle cx={cx} cy={cy} r="190" fill="var(--accent)" opacity=".13" />
            <circle cx={cx} cy={cy} r="128" fill="none" stroke="var(--accent)" strokeWidth="1.4" opacity=".4" />
            <circle cx={cx} cy={cy} r="62" fill="var(--accent)" opacity=".12" />
            <circle cx="64" cy="420" r="6" fill="var(--accent)" opacity=".5" />
          </>
        )}
        {v === 1 && (
          <>
            {[120, 190, 260, 330].map((r, i) => (
              <circle key={r} cx="30" cy="500" r={r} fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity={0.5 - i * 0.09} />
            ))}
            <path d="M400 0 L400 260 L120 0Z" fill="var(--accent)" opacity=".1" />
          </>
        )}
        {v === 2 && (
          <>
            <g transform={`rotate(${rot} 200 240)`}>
              <rect x="70" y="110" width="260" height="260" rx="44" fill="var(--accent)" opacity=".13" />
              <rect x="104" y="144" width="192" height="192" rx="32" fill="none" stroke="var(--accent)" strokeWidth="1.3" opacity=".4" />
            </g>
            {Array.from({ length: 24 }).map((_, i) => (
              <circle key={i} cx={40 + (i % 6) * 12} cy={430 + Math.floor(i / 6) * 12} r="1.8" fill="var(--accent)" opacity=".45" />
            ))}
          </>
        )}
      </svg>
      <div className="plate__icon" style={{ transform: `translate(-50%, -54%) rotate(${v === 2 ? -6 : v === 1 ? 4 : 0}deg) scale(${v === 1 ? 1.12 : 1})` }}>
        <Icon aria-hidden strokeWidth={1.1} />
      </div>
      {showLabel && (
        <div className="plate__label" aria-hidden="true">
          <span>{product.brand}</span>
          <span>{product.model.length > 20 ? product.model.slice(0, 19) + '…' : product.model}</span>
        </div>
      )}
      {product.image && state !== 'failed' && (
        <img
          className={`plate__img${state === 'loaded' ? ' is-in' : ''}`}
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setState('loaded')}
          onError={() => setState('failed')}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Estados vacíos y varios                                             */
/* ------------------------------------------------------------------ */

export function EmptyState({ icon, title, children, actions, tone = 'neutral' }: { icon: ReactNode; title: string; children?: ReactNode; actions?: ReactNode; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`empty empty--${tone}`}>
      <div className="empty__icon" aria-hidden="true">{icon}</div>
      <h3 className="empty__title">{title}</h3>
      {children && <p className="empty__text">{children}</p>}
      {actions && <div className="empty__actions">{actions}</div>}
    </div>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'demo' | 'accent' }) {
  return <span className={`tag tag--${tone}`}>{children}</span>
}

export function Accordion({ items }: { items: { q: string; a: ReactNode }[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const id = useId()
  return (
    <div className="accordion">
      {items.map((it, i) => (
        <div key={i} className={`accordion__item${open === i ? ' is-open' : ''}`}>
          <h3>
            <button type="button" aria-expanded={open === i} aria-controls={`${id}-${i}`} onClick={() => setOpen(open === i ? null : i)}>
              <span>{it.q}</span>
              <LuPlus aria-hidden />
            </button>
          </h3>
          <div id={`${id}-${i}`} role="region" className="accordion__panel" hidden={open !== i}>
            <div>{it.a}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
