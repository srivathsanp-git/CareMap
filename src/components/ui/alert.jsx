import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default:     'bg-background text-foreground',
        info:        'border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600',
        warning:     'border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600',
        destructive: 'border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600',
        success:     'border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

const Alert = forwardRef(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
))
Alert.displayName = 'Alert'

const AlertTitle = forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn('mb-1 font-semibold leading-none tracking-tight', className)} {...props} />
))
AlertTitle.displayName = 'AlertTitle'

const AlertDescription = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
))
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
