import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { FeaturedTuitions } from '@/components/landing/featured-tuitions'
import { RealtimeRefresh } from '@/components/realtime-refresh'

export default function HomePage() {
  return (
    <>
      <RealtimeRefresh tables={['tuitions']} channel="home-tuitions" />
      <Hero />
      <HowItWorks />
      <FeaturedTuitions />
    </>
  )
}
