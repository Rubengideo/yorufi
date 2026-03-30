import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#0F0F0F] px-6 justify-center"
    >
      <View className="space-y-2 mb-10">
        <Text className="text-3xl font-semibold text-white tracking-tight">Welcome back</Text>
        <Text className="text-stone-400 text-sm">We'll send you a magic link to sign in.</Text>
      </View>

      {sent ? (
        <View className="bg-[#1A1A1A] rounded-2xl p-6 items-center space-y-2">
          <Text className="text-white font-medium text-lg">Check your email</Text>
          <Text className="text-stone-400 text-sm text-center">
            Magic link sent to {email}
          </Text>
        </View>
      ) : (
        <View className="space-y-4">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="w-full rounded-2xl border border-stone-800 bg-[#1A1A1A] px-4 py-4 text-white text-sm"
          />

          {error && <Text className="text-red-500 text-sm">{error}</Text>}

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading || !email}
            className="w-full rounded-2xl bg-accent py-4 items-center"
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-sm">Continue with email</Text>
            }
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}
