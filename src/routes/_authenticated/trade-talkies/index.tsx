import { createFileRoute } from '@tanstack/react-router'
import { TradeTalkies } from '@/features/trade-talkies'

export const Route = createFileRoute('/_authenticated/trade-talkies/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: search.tab as string | undefined,
    }
  },
  component: () => {
    const { tab } = Route.useSearch()
    return <TradeTalkies initialTab={tab === 'discover' ? 'discover' : 'myRooms'} />
  },
})