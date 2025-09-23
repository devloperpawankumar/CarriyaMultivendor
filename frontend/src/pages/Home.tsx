import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FlashSale from '../components/FlashSale';
import ExploreInterests from '../components/ExploreInterests';
import Footer from '../components/Footer';
import MobileCategories from '../components/MobileCategories';
import Reveal from '../components/Reveal';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header variant="full" />
      <Reveal>
        <Hero />
      </Reveal>
      <Reveal delayMs={80}>
        <MobileCategories />
      </Reveal>
      <Reveal delayMs={80}>
        <FlashSale />
      </Reveal>
      <Reveal delayMs={50}>
        <ExploreInterests />
      </Reveal>
      <Footer />
    </div>
  );
};

export default Home;
