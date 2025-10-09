"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package } from "lucide-react"

export function InformeTransferenciasComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informe de Transferencias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Componente de informe de transferencias en desarrollo...</p>
      </CardContent>
    </Card>
  )
}
