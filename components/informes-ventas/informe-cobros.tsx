'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformeCobrosComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Cobros</CardTitle>
          <CardDescription>Análisis de cobros y pagos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de cobros realizados. 
            Los datos incluyen información sobre pagos, métodos de pago y tendencias.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}