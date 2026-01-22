"use client";

import { LandingNavbar } from "./_components/LandingNavbar";
import { LandingHero } from "./_components/LandingHero";
import { LandingFeatures } from "./_components/LandingFeatures";
import { LandingFooter } from "./_components/LandingFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />
    </main>
  );
}
