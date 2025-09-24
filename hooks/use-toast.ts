import * as React from "react"

interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

interface Toast extends ToastProps {
  id: string
}

let toastCount = 0

function genId() {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER
  return toastCount.toString()
}

const listeners: Array<(toasts: Toast[]) => void> = []
let toasts: Toast[] = []

function dispatch() {
  listeners.forEach((listener) => {
    listener(toasts)
  })
}

export function toast({ title, description, variant = "default" }: ToastProps) {
  const id = genId()
  const newToast: Toast = { id, title, description, variant }
  
  toasts = [newToast, ...toasts].slice(0, 3) // Máximo 3 toasts
  dispatch()
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    dispatch()
  }, 5000)
  
  return {
    id,
    dismiss: () => {
      toasts = toasts.filter(t => t.id !== id)
      dispatch()
    }
  }
}

export function useToast() {
  const [state, setState] = React.useState<Toast[]>(toasts)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    toasts: state,
    toast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toasts = toasts.filter(t => t.id !== toastId)
      } else {
        toasts = []
      }
      dispatch()
    },
  }
}