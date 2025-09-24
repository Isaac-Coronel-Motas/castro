import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorDisplayProps {
  title: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorDisplay({ title, message, onRetry, className }: ErrorDisplayProps) {
  return (
    <Card className={cn("border-red-200 bg-red-50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-red-700 mb-4">
          {message}
        </CardDescription>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-6xl opacity-20">📋</div>
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </div>
          {action && (
            <Button variant="outline" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}