"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, FileSpreadsheet, Download } from "lucide-react"

interface ExportLogsModalProps {
  isOpen: boolean
  onClose: () => void
  onExport: (format: 'pdf' | 'excel') => void
  dataCount: number
}

export function ExportLogsModal({ isOpen, onClose, onExport, dataCount }: ExportLogsModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel' | null>(null)

  const handleExport = () => {
    if (selectedFormat) {
      onExport(selectedFormat)
      onClose()
      setSelectedFormat(null)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedFormat(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Logs de Auditoría
          </DialogTitle>
          <DialogDescription>
            Selecciona el formato para exportar los {dataCount} registros de auditoría.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedFormat === 'pdf' ? 'default' : 'outline'}
              className={`h-20 flex flex-col items-center justify-center gap-2 ${
                selectedFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' : ''
              }`}
              onClick={() => setSelectedFormat('pdf')}
            >
              <FileText className="h-8 w-8" />
              <span className="text-sm font-medium">PDF</span>
            </Button>

            <Button
              variant={selectedFormat === 'excel' ? 'default' : 'outline'}
              className={`h-20 flex flex-col items-center justify-center gap-2 ${
                selectedFormat === 'excel' ? 'bg-green-600 hover:bg-green-700' : ''
              }`}
              onClick={() => setSelectedFormat('excel')}
            >
              <FileSpreadsheet className="h-8 w-8" />
              <span className="text-sm font-medium">Excel</span>
            </Button>
          </div>

          {selectedFormat && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {selectedFormat === 'pdf' 
                  ? 'Se generará un documento PDF con todos los logs de auditoría en formato tabla.'
                  : 'Se generará una hoja de cálculo Excel con todos los logs de auditoría.'
                }
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleExport}
            disabled={!selectedFormat}
            className={selectedFormat === 'pdf' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar {selectedFormat?.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
