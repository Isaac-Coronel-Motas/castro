import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

export interface LogAuditoria {
  id: number;
  fecha_hora: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalles: string;
  ip: string;
  resultado: string;
  created_at: string;
}

export function exportLogsToPDF(logs: LogAuditoria[], filename?: string) {
  try {
    const doc = new jsPDF('landscape', 'mm', 'a4')
    
    // Título del documento
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Logs de Auditoría - Sistema Taller Castro', 14, 20)
    
    // Información del reporte
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Fecha de generación: ${new Date().toLocaleString('es-CR')}`, 14, 30)
    doc.text(`Total de registros: ${logs.length}`, 14, 35)
    
    // Configurar tabla manual
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 14
    const tableTop = 45
    const rowHeight = 10
    const colWidths = [35, 25, 30, 20, 50, 25, 20] // Anchos de columnas en mm - aumentados
    const colPositions = [margin]
    
    // Calcular posiciones de columnas
    for (let i = 1; i < colWidths.length; i++) {
      colPositions.push(colPositions[i-1] + colWidths[i-1])
    }
    
    // Encabezados
    const headers = ['Fecha/Hora', 'Usuario', 'Acción', 'Módulo', 'Detalles', 'IP', 'Resultado']
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    
    // Dibujar encabezados
    headers.forEach((header, index) => {
      doc.setFillColor(66, 139, 202)
      doc.rect(colPositions[index], tableTop, colWidths[index], rowHeight, 'F')
      doc.setTextColor(255, 255, 255)
      doc.text(header, colPositions[index] + 2, tableTop + 6)
    })
    
    // Datos de la tabla
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    let currentY = tableTop + rowHeight
    
    logs.forEach((log, rowIndex) => {
      // Alternar colores de fila
      if (rowIndex % 2 === 0) {
        doc.setFillColor(245, 245, 245)
        headers.forEach((_, colIndex) => {
          doc.rect(colPositions[colIndex], currentY, colWidths[colIndex], rowHeight, 'F')
        })
      }
      
      const rowData = [
        log.fecha_hora,
        log.usuario,
        log.accion,
        log.modulo,
        log.detalles.length > 40 ? log.detalles.substring(0, 40) + '...' : log.detalles,
        log.ip,
        log.resultado
      ]
      
      rowData.forEach((cellData, colIndex) => {
        // Truncar texto según el ancho de la columna
        let textToShow = cellData.toString()
        const maxChars = Math.floor(colWidths[colIndex] / 1.5) // Aproximadamente 1.5mm por carácter
        
        if (textToShow.length > maxChars) {
          textToShow = textToShow.substring(0, maxChars - 3) + '...'
        }
        
        doc.text(textToShow, colPositions[colIndex] + 2, currentY + 6)
      })
      
      currentY += rowHeight
      
      // Verificar si necesitamos nueva página
      if (currentY > pageHeight - 20) {
        doc.addPage()
        currentY = 20
      }
    })
    
    // Pie de página
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.text(`Página ${i} de ${pageCount}`, margin, pageHeight - 10)
    }
    
    // Guardar el archivo
    const finalFilename = filename || `logs-auditoria-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(finalFilename)
    
    return { success: true, message: 'PDF generado exitosamente' }
  } catch (error) {
    console.error('Error generando PDF:', error)
    return { success: false, message: 'Error al generar el PDF' }
  }
}

export function exportLogsToExcel(logs: LogAuditoria[], filename?: string) {
  try {
    // Preparar datos para Excel
    const excelData = logs.map(log => ({
      'Fecha/Hora': log.fecha_hora,
      'Usuario': log.usuario,
      'Acción': log.accion,
      'Módulo': log.modulo,
      'Detalles': log.detalles,
      'IP': log.ip,
      'Resultado': log.resultado,
      'ID': log.id
    }))
    
    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(excelData)
    
    // Configurar ancho de columnas
    const colWidths = [
      { wch: 20 }, // Fecha/Hora
      { wch: 15 }, // Usuario
      { wch: 20 }, // Acción
      { wch: 15 }, // Módulo
      { wch: 50 }, // Detalles
      { wch: 15 }, // IP
      { wch: 12 }, // Resultado
      { wch: 8 }   // ID
    ]
    ws['!cols'] = colWidths
    
    // Agregar hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Logs de Auditoría')
    
    // Crear hoja de resumen
    const summaryData = [
      ['Resumen de Logs de Auditoría'],
      [''],
      ['Fecha de generación:', new Date().toLocaleString('es-CR')],
      ['Total de registros:', logs.length],
      [''],
      ['Distribución por módulo:'],
      ...Object.entries(
        logs.reduce((acc, log) => {
          acc[log.modulo] = (acc[log.modulo] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([modulo, count]) => [modulo, count]),
      [''],
      ['Distribución por resultado:'],
      ...Object.entries(
        logs.reduce((acc, log) => {
          acc[log.resultado] = (acc[log.resultado] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      ).map(([resultado, count]) => [resultado, count])
    ]
    
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen')
    
    // Guardar el archivo
    const finalFilename = filename || `logs-auditoria-${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, finalFilename)
    
    return { success: true, message: 'Excel generado exitosamente' }
  } catch (error) {
    console.error('Error generando Excel:', error)
    return { success: false, message: 'Error al generar el Excel' }
  }
}
