import { colors } from '../../tokens'

interface ProgressRingConfig {
  total: number
  completed: number
  size?: number
  strokeWidth?: number
  color?: string
}

/**
 * Returns the SVG/Canvas parameters needed to draw a progress ring.
 * Rendering is done per-platform (SVG on web, react-native-svg on mobile).
 */
export function getProgressRingParams({
  total,
  completed,
  size = 80,
  strokeWidth = 6,
  color = colors.accent,
}: ProgressRingConfig) {
  const progress = total === 0 ? 0 : Math.min(completed / total, 1)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - progress)
  const center = size / 2

  return {
    size,
    strokeWidth,
    radius,
    circumference,
    strokeDashoffset,
    center,
    color,
    trackColor: colors.border.light,
    progress,
    percentage: Math.round(progress * 100),
  }
}
