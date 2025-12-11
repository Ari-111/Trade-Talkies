import { createFileRoute } from '@tanstack/react-router'
import { TradeTalkies } from '@/features/trade-talkies'

export const Route = createFileRoute('/_authenticated/trade-talkies/')({
  component: TradeTalkies,
})