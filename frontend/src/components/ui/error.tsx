import { Button } from './button'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading this content.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="gradient">
          Try Again
        </Button>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: string
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon = '📭',
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">
          {message}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="gradient">
          {action.label}
        </Button>
      )}
    </div>
  )
}
