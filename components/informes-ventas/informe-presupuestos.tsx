'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformePresupuestosComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Presupuestos</CardTitle>
          <CardDescription>Análisis de presupuestos</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de presupuestos. 
            Los datos incluyen información sobre presupuestos generados, aprobados y rechazados.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}