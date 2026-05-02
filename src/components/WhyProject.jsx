import React from 'react'

export default function WhyProject() {
  return (
    <section id="why-project" className="why-project" aria-labelledby="why-heading">
      <div className="about-intro why-project-intro">
        <h2 id="why-heading" className="about-visually-hidden">
          Why I made this project
        </h2>
        <span className="about-kicker">Why I made this project</span>
        <div className="about-intro-copy">
          <p className="about-intro-graph">
            This project was built at the intersection of my interest in data-driven systems, real-world infrastructure problems,
            and emerging mobility technologies such as{' '}
            <strong className="about-accent-inline">autonomous vehicles</strong>.
          </p>
          <p className="about-intro-graph">
            Through my academic work in Computer Science at King&apos;s College London, along with earlier experience in data
            analysis, machine learning, and simulation-based projects, I have consistently been drawn to how complex systems can
            be understood through large-scale datasets. Published research on{' '}
            <strong className="about-accent-inline">public perception of autonomous vehicles in India</strong>{' '}
            further strengthened this interest, especially in how data, perception, and safety outcomes interact in real-world
            transport systems.
          </p>
          <p className="about-intro-graph">
            This dashboard is a continuation of that exploration. It uses a large dataset of road crash records to study spatial and
            temporal patterns in road safety, transforming raw data into{' '}
            <strong className="about-accent-inline">interactive visual insights</strong>. The goal is to make these patterns easier
            to explore and interpret, rather than relying on static reports or isolated statistics.
          </p>
          <p className="about-intro-graph">
            I am currently continuing research into autonomous vehicle adoption, focusing on how safety data, infrastructure
            conditions, and behavioural patterns influence trust and readiness for future mobility systems. This project serves as a
            practical extension of that research direction, helping bridge data analysis with real-world transportation
            understanding.
          </p>
        </div>
      </div>
    </section>
  )
}
