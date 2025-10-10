'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformeRemisionesComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Notas de Remisión</CardTitle>
          <CardDescription>Análisis de notas de remisión</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de notas de remisión. 
            Los datos incluyen información sobre remisiones de compra, venta y transferencias.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}