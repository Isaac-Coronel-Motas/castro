'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformeNotasComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Notas Crédito/Débito</CardTitle>
          <CardDescription>Análisis de notas de crédito y débito</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de notas de crédito y débito. 
            Los datos incluyen información sobre operaciones de compra y venta.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}