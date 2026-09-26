'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionState } from '@/lib/types'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Enter a valid phone number'),
  subjects: z
    .string()
    .trim()
    .min(1, 'List at least one subject')
    .max(300)
    .transform((v) =>
      v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15),
    ),
  qualifications: z.string().trim().min(2, 'Add your qualifications').max(1000),
  experience: z.string().trim().max(1000),
})

export async function updateTutorProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false, message: 'Please log in again.' }

  const parsed = profileSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted fields.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    }
  }

  const { error } = await supabase
    .from('tutors')
    .upsert(
      { ...parsed.data, auth_user_id: user.id, email: user.email },
      { onConflict: 'auth_user_id' },
    )

  if (error) {
    console.error('tutor profile upsert failed', error)
    return { ok: false, message: 'Could not save your profile. Please try again.' }
  }

  revalidatePath('/dashboard')
  return { ok: true, message: 'Profile saved.' }
}

const applySchema = z.object({
  tuition_id: z.uuid(),
  cover_note: z
    .string()
    .trim()
    .max(1000, 'Keep your note under 1000 characters')
    .transform((v) => (v === '' ? null : v)),
})

export async function applyToTuition(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applySchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Please log in to apply.' }

  const { data: tutor } = await supabase
    .from('tutors')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()
  if (!tutor) {
    return { ok: false, message: 'Complete your tutor profile before applying.' }
  }

  const { error } = await supabase.from('applications').insert({
    tuition_id: parsed.data.tuition_id,
    tutor_id: tutor.id,
    cover_note: parsed.data.cover_note,
    status: 'pending',
  })

  if (error) {
    if (error.code === '23505') {
      return { ok: false, message: 'You have already applied to this tuition.' }
    }
    console.error('application insert failed', error)
    return {
      ok: false,
      message: 'Could not submit your application. The tuition may be closed.',
    }
  }

  revalidatePath(`/tuitions/${parsed.data.tuition_id}`)
  revalidatePath('/dashboard')
  return { ok: true, message: 'Application submitted! Track it from your dashboard.' }
}

export async function withdrawApplication(formData: FormData) {
  const id = z.uuid().safeParse(formData.get('id'))
  if (!id.success) return

  const supabase = await createClient()
  await supabase.from('applications').delete().eq('id', id.data).eq('status', 'pending')
  revalidatePath('/dashboard')
}
