import type { Metadata } from 'next'
import { TasksView } from '@/components/tasks/TasksView'

export const metadata: Metadata = { title: 'Taken' }

export default function TasksPage() {
  return <TasksView />
}
