import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "./button"

interface ErrorDisplayProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ 
  title = "Error", 
  message, 
  onRetry, 
  className = "" 
}: ErrorDisplayProps) {
  return (
    <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 text-red-800">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-red-600 text-sm mt-1">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-2"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-muted-foreground mb-4">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
