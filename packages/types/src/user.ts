export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  timezone: string
  email_digest: boolean
  theme: 'light' | 'dark' | 'system'
  currency: string
  push_token: string | null
  created_at: string
}
