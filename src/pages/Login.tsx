import { useState } from 'react'
import { LuArrowRight, LuGlobe, LuInfo } from 'react-icons/lu'
import { DEMO_ACCOUNT } from '../config'
import { COUNTRIES } from '../data/countries'
import { PRODUCT_BY_ID } from '../data/products'
import { navigate } from '../lib/router'
import { useStore } from '../store'
import { PasswordField, ProductPlate, Segmented, TextField, Wordmark } from '../components/ui'

type Mode = 'login' | 'register'
type Errors = Partial<Record<'name' | 'email' | 'password' | 'form', string>>

const ORBIT = ['iphone-15-pro', 'sony-wh-1000xm5', 'sony-a7-iv', 'corsair-vengeance-ddr5-32'].map((id) => PRODUCT_BY_ID[id])

export function LoginPage() {
  const { login, register, loginDemo } = useStore()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [busy, setBusy] = useState(false)

  const switchMode = (m: Mode) => {
    setMode(m)
    setErrors({})
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const res = mode === 'login' ? login(email, password) : register(name, email, password)
    if (!res.ok) {
      setErrors({ [res.field ?? 'form']: res.error })
      return
    }
    setBusy(true)
    window.setTimeout(() => navigate('/'), 450)
  }

  const demo = () => {
    setBusy(true)
    loginDemo()
    window.setTimeout(() => navigate('/'), 450)
  }

  return (
    <div className="login">
      <section className="login__art" aria-hidden="true">
        <div className="login__grain" />
        <div className="login__brand rise" style={{ '--d': '0ms' } as React.CSSProperties}><Wordmark light /></div>

        <div className="orbit">
          <div className="orbit__ring orbit__ring--1" />
          <div className="orbit__ring orbit__ring--2" />
          <div className="orbit__ring orbit__ring--3" />
          <svg className="orbit__text" viewBox="0 0 200 200">
            <defs><path id="circ" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" /></defs>
            <text><textPath href="#circ" startOffset="0" textLength="508" lengthAdjust="spacing">DESCUBRE · SOLICITA · COORDINA · DESCUBRE · SOLICITA · COORDINA ·</textPath></text>
          </svg>
          <div className="orbit__globe"><LuGlobe /></div>
          {ORBIT.map((p, i) => (
            <div key={p.id} className={`orbit__plate orbit__plate--${i + 1}`}>
              <ProductPlate product={p} variant={i} showLabel={false} />
            </div>
          ))}
        </div>

        <div className="login__statement">
          <p className="rise" style={{ '--d': '200ms' } as React.CSSProperties}>
            El mundo, a una <em>solicitud</em> de distancia.
          </p>
          <ul className="login__stamps rise" style={{ '--d': '380ms' } as React.CSSProperties}>
            {COUNTRIES.map((c) => <li key={c.id}>{c.code}</li>)}
          </ul>
          <small className="rise" style={{ '--d': '460ms' } as React.CSSProperties}>Ubicaciones de proveedores de demostración. No indican destinos de entrega.</small>
        </div>
      </section>

      <section className="login__panel">
        <div className="login__brand-mobile"><Wordmark /></div>
        <div className="login__card">
          <p className="eyebrow rise" style={{ '--d': '60ms' } as React.CSSProperties}>Acceso de demostración</p>
          <h1 className="login__title rise" style={{ '--d': '120ms' } as React.CSSProperties}>
            {mode === 'login' ? <>Bienvenido <em>de vuelta</em></> : <>Crea tu <em>acceso</em></>}
          </h1>
          <p className="login__sub rise" style={{ '--d': '170ms' } as React.CSSProperties}>
            Explora productos internacionales y cuéntanos qué te gustaría conseguir. Sin precios en pantalla: la cotización llega por Instagram.
          </p>

          <div className="rise" style={{ '--d': '220ms' } as React.CSSProperties}>
            <Segmented<Mode> label="Tipo de acceso" value={mode} onChange={switchMode} options={[{ value: 'login', label: 'Ingresar' }, { value: 'register', label: 'Crear cuenta' }]} />
          </div>

          <form onSubmit={submit} noValidate className="login__form" key={mode}>
            <div className="login__form-in">
              {mode === 'register' && (
                <TextField label="Nombre" name="name" autoComplete="name" value={name} onChange={(v) => { setName(v); setErrors((x) => ({ ...x, name: undefined })) }} error={errors.name} placeholder="Cómo te llamamos" />
              )}
              <TextField label="Correo electrónico" name="email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(v) => { setEmail(v); setErrors((x) => ({ ...x, email: undefined })) }} error={errors.email} placeholder="nombre@correo.com" />
              <PasswordField
                label="Contraseña"
                name="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })) }}
                error={errors.password}
                hint={mode === 'register' ? 'Mínimo 8 caracteres, con letras y números.' : undefined}
                placeholder="••••••••"
              />
              <button type="submit" className="btn btn--primary btn--lg btn--block" disabled={busy}>
                {busy ? 'Entrando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta y entrar'} <LuArrowRight aria-hidden />
              </button>
            </div>
          </form>

          <div className="login__or"><span>o</span></div>
          <button type="button" className="btn btn--outline btn--block" onClick={demo} disabled={busy}>
            Entrar con la cuenta demo
          </button>
          <p className="login__demo">
            <LuInfo aria-hidden />
            <span>
              Acceso simulado: cualquier correo válido con una contraseña de 8 o más caracteres funciona (o prueba <code>{DEMO_ACCOUNT.email}</code>). No guardamos contraseñas; solo tu nombre y correo en este navegador.
            </span>
          </p>
        </div>
      </section>
    </div>
  )
}
