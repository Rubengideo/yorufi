import { Tabs } from 'expo-router'
import { Text } from 'react-native'

function TabIcon({ symbol, focused }: { symbol: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.4 }}>{symbol}</Text>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F0F0F',
          borderTopColor: '#1A1A1A',
          height: 80,
          paddingBottom: 20,
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => <TabIcon symbol="◎" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarIcon: ({ focused }) => <TabIcon symbol="≡" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ focused }) => <TabIcon symbol="∿" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => <TabIcon symbol="⊙" focused={focused} />,
        }}
      />
    </Tabs>
  )
}
