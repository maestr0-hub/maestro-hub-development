'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getViewer } from '@/lib/auth'
import type { ActionState } from '@/lib/types'

async function adminClient() {
  const { supabase, isAdmin } = await getViewer()
  return isAdmin ? supabase : null
}

const requestEditSchema = z.object({
  id: z.uuid(),
  intent: z.enum(['save', 'publish', 'reject']),
  student_class: z.string().trim().min(1, 'Class is required').max(60),
  subject: z.string().trim().min(1, 'Subject is required').max(80),
  location: z.string().trim().min(2, 'Location is required').max(150),
  schedule: z.string().trim().min(2, 'Schedule is required').max(150),
  budget: z.coerce.number().int().positive('Budget must be positive'),
  notes: z.string().trim().max(1000),
  title: z.string().trim().max(150),
  salary: z.coerce.number().int().nonnegative(),
  description: z.string().trim().max(2000),
})

export async function handleGuardianRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await adminClient()
  if (!supabase) return { ok: false, message: 'Not authorized.' }

  const parsed = requestEditSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }
  const { id, intent, title, salary, description, notes, ...fields } = parsed.data

  if (intent === 'reject') {
    const { error } = await supabase
      .from('guardian_requests')
      .update({ status: 'rejected' })
      .eq('id', id)
    if (error) return { ok: false, message: 'Could not reject request.' }
    revalidatePath('/admin')
    return { ok: true, message: 'Request rejected.' }
  }

  const { error: updateError } = await supabase
    .from('guardian_requests')
    .update({
      ...fields,
      notes: notes || null,
      ...(intent === 'publish' ? { status: 'approved' } : {}),
    })
    .eq('id', id)
  if (updateError) return { ok: false, message: 'Could not update request.' }

  if (intent === 'publish') {
    if (title.length < 4) {
      return { ok: false, message: 'Add a post title (at least 4 characters) before publishing.' }
    }
    const { error } = await supabase.from('tuitions').insert({
      title,
      subject: fields.subject,
      class: fields.student_class,
      location: fields.location,
      schedule: fields.schedule,
      salary: salary > 0 ? salary : fields.budget,
      description: description || null,
      status: 'open',
      source_request_id: id,
    })
    if (error) {
      console.error('tuition publish failed', error)
      return { ok: false, message: 'Request approved, but publishing failed. Try again.' }
    }
    revalidatePath('/tuitions')
    revalidatePath('/')
  }

  revalidatePath('/admin')
  return {
    ok: true,
    message: intent === 'publish' ? 'Published to the tuition board.' : 'Changes saved.',
  }
}

export async function setTuitionStatus(formData: FormData) {
  const supabase = await adminClient()
  if (!supabase) return
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(['open', 'closed']) })
    .safeParse(Object.fromEntries(formData))
  if (!parsed.success) return

  await supabase.from('tuitions').update({ status: parsed.data.status }).eq('id', parsed.data.id)
  revalidatePath('/admin')
  revalidatePath('/tuitions')
  revalidatePath(`/tuitions/${parsed.data.id}`)
}

export async function setApplicationStatus(formData: FormData) {
  const supabase = await adminClient()
  if (!supabase) return
  const parsed = z
    .object({ id: z.uuid(), status: z.enum(['pending', 'accepted', 'rejected']) })
    .safeParse(Object.fromEntries(formData))
  if (!parsed.success) return

  await supabase
    .from('applications')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id)
  revalidatePath('/admin')
}
