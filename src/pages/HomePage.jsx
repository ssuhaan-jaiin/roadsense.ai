import React from 'react'
import SiteHeader from '../components/SiteHeader'
import Hero from '../components/Hero'
import WhyProject from '../components/WhyProject'
import LandingAbout from '../components/LandingAbout'
import SiteFooter from '../components/SiteFooter'

export default function HomePage() {
  return (
    <div className="home-page">
      <SiteHeader />
      <Hero />
      <LandingAbout />
      <WhyProject />
      <SiteFooter />
    </div>
  )
}
