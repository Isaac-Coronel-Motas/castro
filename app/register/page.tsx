"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { Wrench, User, Mail, Lock, Eye, EyeOff, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const { register, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar nombre de usuario
    if (!formData.username) {
      newErrors.username = "Nombre de usuario requerido"
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = "3-30 caracteres, solo letras, números y guiones bajos"
    }

    // Validar email
    if (!formData.email) {
      newErrors.email = "Email inválido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "Contraseña requerida"
    } else if (formData.password.length < 8) {
      newErrors.password = "Mínimo 8 caracteres"
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    // Validar términos
    if (!formData.acceptTerms) {
      newErrors.terms = "Debe aceptar los términos y condiciones"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      await register(formData.username, formData.email, formData.password)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
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
          <Link href="/login">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-slate-800 bg-transparent"
            >
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            {/* Card Header with Blue Background */}
            <CardHeader className="bg-blue-600 text-white text-center py-8 rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <User className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Registro de Usuario</h1>
              <p className="text-blue-100 mt-2">Taller de Electrónica & Informática Jaime Castro e Hijos</p>
            </CardHeader>

            <CardContent className="p-6">
              {/* Demo Info */}
              <Alert className="mb-6 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Demo:</strong> El registro te llevará directamente al dashboard
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre de Usuario */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4 text-blue-600" />
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
                  <p className="text-xs text-gray-500">3-30 caracteres, solo letras, números y guiones bajos</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Ingrese su email"
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </div>
                  )}
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4 text-blue-600" />
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
                  <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                </div>

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Confirmar Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                      placeholder="Confirme su contraseña"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                {/* Términos y Condiciones */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleInputChange("acceptTerms", checked as boolean)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="terms" className="text-sm">
                    Acepto los{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      términos y condiciones
                    </Link>
                  </Label>
                </div>
                {errors.terms && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.terms}
                  </div>
                )}

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <Link href="/login" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                      disabled={isLoading}
                    >
                      Volver al Login
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    ) : (
                      <User className="h-4 w-4 mr-2" />
                    )}
                    {isLoading ? "Registrando..." : "Registrarse"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
