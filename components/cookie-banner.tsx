'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X, ShieldCheck } from 'lucide-react'

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <div className="container max-w-7xl mx-auto">
        <div className="bg-background border shadow-2xl rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="p-3 rounded-full bg-primary/10 text-primary hidden md:block">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-lg font-bold">Aviso de Privacidad y Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia y procesar tus pedidos. Al continuar navegando, aceptas nuestra 
              <Link href="/politicas" className="font-semibold text-foreground mx-1 hover:text-primary underline transition-colors">
                Política de Tratamiento de Datos Personales
              </Link> 
              conforme a la Ley 1581 de 2012.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Button variant="outline" size="lg" className="text-sm font-semibold" onClick={() => setIsVisible(false)}>
              Configurar
            </Button>
            <Button size="lg" className="text-sm font-semibold px-8" onClick={acceptCookies}>
              Aceptar y Continuar
            </Button>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
