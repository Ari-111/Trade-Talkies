import { ContentSection } from '../components/content-section'
import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <ContentSection
      title='Settings › Appearance'
      desc='Customize the app look. Switch themes and fonts.'
      compact
      titleClassName='text-base'
      descClassName='text-xs'
    >
      <AppearanceForm />
    </ContentSection>
  )
}
