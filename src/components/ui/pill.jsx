import { cva } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Pill / Chip — UI spec §2. Variants: default, filled, action, risk.
// Pass `onRemove` to render a removable active-filter chip (× button).
const pillVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border font-medium leading-none whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'border-ink/25 bg-paper text-ink hover:border-ink/50',
        filled:  'border-ink bg-ink text-paper',
        action:  'border-action bg-action/12 text-action',
        risk:    'border-risk bg-risk/12 text-risk',
      },
      size: {
        sm: 'px-2.5 py-1 text-xs',
        md: 'px-3 py-1.5 text-[13px]',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  }
)

export function Pill({ className, variant, size, children, onRemove, onClick, ...props }) {
  return (
    <span
      className={cn(pillVariants({ variant, size }), onClick && 'cursor-pointer', className)}
      onClick={onClick}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="-mr-0.5 ml-0.5 rounded-full p-0.5 hover:bg-ink/10"
          aria-label="Remove filter"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
