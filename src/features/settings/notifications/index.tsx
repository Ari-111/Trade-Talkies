import { ContentSection } from '../components/content-section'
import { NotificationsForm } from './notifications-form'

export function SettingsNotifications() {
  return (
    <ContentSection
      title='Settings › Notifications'
      desc='Configure how you receive notifications.'
      titleClassName='text-base'
      descClassName='text-xs'
      compact
    >
      <NotificationsForm />
    </ContentSection>
  )
}
