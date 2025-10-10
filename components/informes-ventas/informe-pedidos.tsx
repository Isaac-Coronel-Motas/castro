'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InformePedidosComponent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informe de Pedidos de Clientes</CardTitle>
          <CardDescription>Análisis de pedidos y órdenes de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Este informe muestra el análisis de pedidos de clientes. 
            Los datos se basan en las ventas con estado "pendiente" o similares.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}