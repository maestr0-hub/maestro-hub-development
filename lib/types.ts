export type Tutor = {
  id: string
  email: string
  full_name: string
  subjects: string | null
  bio: string | null
  hourly_rate: number | null
  location: string | null
  phone: string | null
  created_at: string
}

export type GuardianRequest = {
  id: string
  guardian_name: string
  guardian_email: string
  guardian_phone: string | null
  student_name: string | null
  subject: string
  level: string | null
  details: string | null
  budget: string | null
  status: string
  created_at: string
}

export type Tuition = {
  id: string
  request_id: string | null
  title: string
  subject: string
  level: string | null
  details: string | null
  budget: string | null
  status: string
  created_at: string
}

export type Application = {
  id: string
  tutor_id: string
  tuition_id: string
  message: string | null
  status: string
  created_at: string
  tuitions?: Tuition
}
