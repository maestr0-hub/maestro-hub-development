import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const styles: Record<string, string> = {
  pending: 'border-accent/40 bg-accent/15 text-foreground',
  accepted: 'border-primary/40 bg-primary/15 text-foreground',
  approved: 'border-primary/40 bg-primary/15 text-foreground',
  open: 'border-primary/40 bg-primary/15 text-foreground',
  rejected: 'border-destructive/40 bg-destructive/10 text-destructive',
  closed: 'border-border bg-muted text-muted-foreground',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={cn('capitalize', styles[status])}>
      {status}
    </Badge>
  )
}
