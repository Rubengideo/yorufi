/** Returns today's date in YYYY-MM-DD in the user's local timezone */
export function todayLocal(): string {
  const now = new Date()
  return now.toLocaleDateString('en-CA') // 'en-CA' gives YYYY-MM-DD format
}

/** Returns YYYY-MM-DD for any Date object */
export function toDateString(date: Date): string {
  return date.toLocaleDateString('en-CA')
}
