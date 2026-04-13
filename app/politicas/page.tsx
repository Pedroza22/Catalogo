import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getProfile } from '@/lib/actions/auth'
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react'

export default async function PoliticasPage() {
  const profile = await getProfile()
  const user = profile ? { email: profile.email, role: profile.role } : null

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header user={user} />
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="bg-background rounded-3xl shadow-xl border overflow-hidden">
          <div className="bg-primary p-8 md:p-12 text-primary-foreground">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Políticas y Privacidad</h1>
            <p className="text-primary-foreground/80 text-lg max-w-2xl">
              En AS DE NARIÑO, nos tomamos en serio la protección de tus datos y tu experiencia de navegación.
            </p>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Navegación Rápida */}
            <aside className="w-full md:w-64 bg-muted/50 p-6 border-r">
              <nav className="sticky top-24 space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Contenido</p>
                <a href="#tratamiento" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-lg hover:bg-background">
                  <Shield className="h-4 w-4" /> Tratamiento de Datos
                </a>
                <a href="#cookies" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-lg hover:bg-background">
                  <Eye className="h-4 w-4" /> Uso de Cookies
                </a>
                <a href="#seguridad" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-lg hover:bg-background">
                  <Lock className="h-4 w-4" /> Seguridad
                </a>
                <a href="#derechos" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors p-2 rounded-lg hover:bg-background">
                  <FileText className="h-4 w-4" /> Tus Derechos
                </a>
              </nav>
            </aside>

            {/* Contenido Principal */}
            <div className="flex-1 p-8 md:p-12 space-y-12">
              {/* Sección 1: Tratamiento de Datos */}
              <section id="tratamiento" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Tratamiento de Datos Personales</h2>
                </div>
                <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
                  <p>
                    Conforme a la <strong>Ley 1581 de 2012</strong> de Protección de Datos Personales en Colombia, AS DE NARIÑO 
                    informa que los datos recolectados serán utilizados para:
                  </p>
                  <ul className="grid gap-3 mt-4">
                    <li className="flex items-start gap-2 italic">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      Procesar y entregar tus pedidos de manera eficiente.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      Gestionar tu cuenta de usuario y historial de compras.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      Enviar actualizaciones sobre el estado de tus pedidos.
                    </li>
                    <li className="flex items-start gap-2 italic">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      Brindar soporte técnico y atención al cliente personalizada.
                    </li>
                  </ul>
                </div>
              </section>

              {/* Sección 2: Uso de Cookies */}
              <section id="cookies" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Eye className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Uso de Cookies</h2>
                </div>
                <div className="prose prose-slate max-w-none text-muted-foreground leading-relaxed">
                  <p>
                    Utilizamos cookies técnicas y analíticas para que el sitio funcione correctamente. 
                    Esto nos permite recordar los productos en tu carrito y mantener tu sesión iniciada.
                  </p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <h4 className="font-bold text-foreground mb-2">Cookies Necesarias</h4>
                      <p className="text-xs">Esenciales para el carrito de compras y la seguridad del login.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-muted/30">
                      <h4 className="font-bold text-foreground mb-2">Cookies Analíticas</h4>
                      <p className="text-xs">Nos ayudan a entender qué productos son los más buscados.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 3: Seguridad */}
              <section id="seguridad" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Seguridad de la Información</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  Toda la información viaja de forma cifrada mediante protocolos SSL. No almacenamos datos sensibles 
                  de tarjetas de crédito en nuestros servidores, delegando el procesamiento a pasarelas seguras.
                </p>
              </section>

              {/* Sección 4: Derechos */}
              <section id="derechos" className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">Tus Derechos (Habeas Data)</h2>
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  Como titular de los datos, tienes derecho a conocer, actualizar, rectificar o solicitar la 
                  eliminación de tu información personal en cualquier momento.
                </p>
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <p className="text-sm font-medium text-primary mb-2">Para ejercer tus derechos, contáctanos:</p>
                  <p className="text-sm text-muted-foreground">Correo: contacto@asdenarino.com</p>
                  <p className="text-sm text-muted-foreground">Asunto: Solicitud de Habeas Data</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
