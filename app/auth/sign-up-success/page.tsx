import { MailCheck } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="size-6" aria-hidden />
      </span>
      <h1 className="font-heading text-2xl font-semibold">Check your email</h1>
      <p className="text-muted-foreground">
        We sent you a confirmation link. Confirm your email to activate your tutor
        account and start applying to tuitions.
      </p>
    </div>
  )
}
