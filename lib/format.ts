export const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Bangla',
  'ICT',
  'Accounting',
  'Economics',
  'General Science',
  'All Subjects',
] as const

export const CLASSES = [
  'Class 1-5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10 (SSC)',
  'Class 11',
  'Class 12 (HSC)',
  'O Level',
  'A Level',
  'University Admission',
] as const

export function formatMoney(amount: number) {
  return `৳${new Intl.NumberFormat('en-US').format(amount)}`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export const selectClassName =
  'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30'
