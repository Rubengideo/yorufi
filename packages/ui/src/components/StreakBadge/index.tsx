import React from 'react'
import { colors, fontSizes, radius, spacing } from '../../tokens'

interface StreakBadgeProps {
  streak: number
  size?: 'sm' | 'md'
}

/**
 * Platform-agnostic: returns style objects so it works with both
 * React Native StyleSheet and CSS-in-JS / inline styles on web.
 */
export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const isSm = size === 'sm'
  return {
    streak,
    label: streak === 1 ? '1 day' : `${streak} days`,
    containerStyle: {
      backgroundColor: streak > 0 ? colors.accent : colors.muted.light,
      borderRadius: radius.full,
      paddingHorizontal: isSm ? spacing[2] : spacing[3],
      paddingVertical: isSm ? 2 : spacing[1],
      alignSelf: 'flex-start' as const,
    },
    textStyle: {
      color: '#FFFFFF',
      fontSize: isSm ? fontSizes.xs : fontSizes.sm,
      fontWeight: '600' as const,
    },
  }
}
