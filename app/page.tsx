import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Mail, UserCheck, Wrench } from "lucide-react"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <span className="font-semibold">Taller de Electrónica & Informática Jaime Castro e Hijos</span>
          </div>
          <Button
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-slate-800 bg-transparent"
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Welcome Section */}
          <div className="mb-12">
            <div className="flex justify-center mb-6">
              <div className="bg-blue-600 p-4 rounded-full">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bienvenido a App Segura</h1>
            <p className="text-xl text-gray-600 mb-8">
              Una aplicación con autenticación de dos factores, recuperación de contraseña y más.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-16">
              <Link href="/register">
                <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg">
                  <UserCheck className="h-5 w-5 mr-2" />
                  Registrarse
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg bg-transparent"
                >
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Autenticación 2FA */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Autenticación 2FA</h3>
                <p className="text-gray-600">
                  Protege tu cuenta con autenticación de dos factores usando Google Authenticator.
                </p>
              </CardContent>
            </Card>

            {/* Recuperación por Email */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Recuperación por Email</h3>
                <p className="text-gray-600">Recupera tu contraseña fácilmente a través de tu correo electrónico.</p>
              </CardContent>
            </Card>

            {/* Registro Seguro */}
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Registro Seguro</h3>
                <p className="text-gray-600">Registro de usuarios con validación de email y contraseñas seguras.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
