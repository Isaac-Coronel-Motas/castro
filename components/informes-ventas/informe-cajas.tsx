'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformeCajasComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Apertura/Cierre Caja</CardTitle>
          <CardDescription>Análisis de cajas registradoras</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de apertura y cierre de cajas registradoras. 
            Los datos incluyen información sobre transacciones por caja y rendimiento.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}