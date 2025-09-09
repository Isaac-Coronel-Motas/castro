"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Wrench, User, Lock, Eye, EyeOff, AlertCircle, Shield, Info } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loginError, setLoginError] = useState("")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username) {
      newErrors.username = "Nombre de usuario requerido"
    }

    if (!formData.password) {
      newErrors.password = "Contraseña requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")

    if (validateForm()) {
      const success = await login(formData.username, formData.password)
      if (!success) {
        setLoginError("Credenciales incorrectas. Intenta con: admin / admin123")
      }
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (loginError) {
      setLoginError("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6" />
            <span className="font-semibold">Taller de Electrónica & Informática Jaime Castro e Hijos</span>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-800 bg-transparent"
            >
              Registrarse
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                  <User className="h-6 w-6" />
                  Iniciar Sesión
                </h1>
              </div>

              {/* Security Alert */}
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Sistema Seguro:</strong> Después de 3 intentos fallidos, tu cuenta será bloqueada por 15
                  minutos.
                </AlertDescription>
              </Alert>

              {/* Demo Credentials Alert */}
              <Alert className="mb-6 border-green-200 bg-green-50">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Demo:</strong> Usuario: admin | Contraseña: admin123
                </AlertDescription>
              </Alert>

              {/* Login Error */}
              {loginError && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{loginError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre de Usuario */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Nombre de Usuario
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className={errors.username ? "border-red-500" : ""}
                    placeholder="Ingrese su nombre de usuario"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.username}
                    </div>
                  )}
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                      placeholder="Ingrese su contraseña"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </div>
                  )}
                </div>

                {/* Recordar Sesión */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Recordar mi sesión por 30 días
                  </Label>
                </div>

                {/* Botón de Login */}
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>

                {/* Enlaces */}
                <div className="text-center space-y-2 mt-4">
                  <div>
                    <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <div className="text-sm text-gray-600">
                    ¿No tienes cuenta?{" "}
                    <Link href="/register" className="text-blue-600 hover:underline">
                      Regístrate aquí
                    </Link>
                  </div>
                </div>
              </form>

              {/* Consejos de Seguridad */}
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-gray-600" />
                  <h3 className="font-medium text-gray-900">Consejos de Seguridad:</h3>
                </div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Nunca compartas tus credenciales</li>
                  <li>• Usa una contraseña única y segura</li>
                  <li>• Habilita 2FA para mayor seguridad</li>
                  <li>• Cierra sesión en dispositivos compartidos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
