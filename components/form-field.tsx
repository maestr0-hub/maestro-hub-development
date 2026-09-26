import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FormField({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function FormMessage({ ok, message }: { ok: boolean; message: string }) {
  return (
    <p
      role="status"
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        ok
          ? 'border-primary/30 bg-primary/10 text-foreground'
          : 'border-destructive/30 bg-destructive/10 text-destructive',
      )}
    >
      {message}
    </p>
  )
}
