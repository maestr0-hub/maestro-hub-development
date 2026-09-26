'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))

const requestSchema = z.object({
  guardian_name: z.string().trim().min(2, 'Please enter your name').max(100),
  guardian_contact: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),
  guardian_email: z
    .union([z.literal(''), z.email('Enter a valid email')])
    .transform((v) => (v === '' ? null : v)),
  student_class: z.string().trim().min(1, 'Select a class').max(60),
  subject: z.string().trim().min(1, 'Select a subject').max(80),
  location: z.string().trim().min(2, 'Enter the area / location').max(150),
  schedule: z.string().trim().min(2, 'Describe the preferred schedule').max(150),
  budget: z.coerce
    .number({ error: 'Enter a monthly budget' })
    .int('Budget must be a whole number')
    .min(500, 'Budget must be at least ৳500')
    .max(500000, 'Budget seems too high'),
  notes: optionalText(1000),
})

export async function submitGuardianRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('guardian_requests')
    .insert({ ...parsed.data, status: 'pending' })

  if (error) {
    console.error('guardian request insert failed', error)
    return { ok: false, message: 'Could not submit your request. Please try again.' }
  }

  return {
    ok: true,
    message:
      'Thanks! Your request has been received. Our team will review it and contact you shortly.',
  }
}
