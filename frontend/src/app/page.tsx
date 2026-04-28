import { Suspense } from 'react';
import HomeHero from '@/components/sections/home/HomeHero';
import FeaturedCollections from '@/components/sections/home/FeaturedCollections';
import LookbookSection from '@/components/sections/home/LookbookSection';
import EditorialStory from '@/components/sections/home/EditorialStory';
import CallToAction from '@/components/sections/home/CallToAction';

export default function Home() {
  return (
    <div className="w-full overflow-hidden">
      <Suspense fallback={<div className="h-screen bg-[#0a0a0a] animate-pulse" />}>
        <HomeHero />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-[#f7f4ef] animate-pulse" />}>
        <FeaturedCollections />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-[#0a0a0a] animate-pulse" />}>
        <EditorialStory />
      </Suspense>
      <Suspense fallback={<div className="h-96 bg-[#f7f4ef] animate-pulse" />}>
        <LookbookSection />
      </Suspense>
      <CallToAction />
    </div>
  );
}
