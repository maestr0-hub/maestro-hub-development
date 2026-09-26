export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type TuitionStatus = 'open' | 'closed'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export type Tutor = {
  id: string
  auth_user_id: string
  name: string
  email: string
  phone: string | null
  subjects: string[]
  qualifications: string | null
  experience: string | null
  created_at: string
}

export type GuardianRequest = {
  id: string
  guardian_name: string
  guardian_contact: string
  guardian_email: string | null
  student_class: string
  subject: string
  location: string
  schedule: string
  budget: number
  notes: string | null
  status: RequestStatus
  created_at: string
}

export type Tuition = {
  id: string
  title: string
  subject: string
  class: string
  location: string
  schedule: string
  salary: number
  description: string | null
  status: TuitionStatus
  source_request_id: string | null
  created_at: string
}

export type Application = {
  id: string
  tuition_id: string
  tutor_id: string
  cover_note: string | null
  status: ApplicationStatus
  applied_at: string
}

export type ActionState = {
  ok: boolean
  message: string
  fieldErrors?: Record<string, string[] | undefined>
} | null
