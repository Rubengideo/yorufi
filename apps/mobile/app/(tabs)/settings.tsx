import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#0F0F0F] px-5">
      <View className="py-6">
        <Text className="text-white text-2xl font-semibold">Settings</Text>
      </View>

      <View className="rounded-2xl border border-stone-800 overflow-hidden">
        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          className="px-5 py-4 flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <Text className="text-white text-sm font-medium">Sign out</Text>
          <Text className="text-red-500 text-sm font-medium">Sign out →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
