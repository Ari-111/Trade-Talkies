import { ContentSection } from '../components/content-section'
import { ProfileForm } from '../profile/profile-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Profile'
      desc='Update your profile settings.'
    >
      <ProfileForm />
    </ContentSection>
  )
}
