import React, { useEffect, useRef, useState } from "react";
import HomeHero from "./HomeHero";
import HomeModels from "./HomeModels";
import HomeCasting from "./HomeCasting";
import HomeContact from "./HomeContact";
import { useInView } from "motion/react";
import { useBubbleAnimation } from "../utils/bubbleAnimation";
import { ModelProvider } from "../contexts/ModelContext";
import Navigation from "./Navigation";

const Homepage = () => {
  const { canvasProps } = useBubbleAnimation({
    bubbleCount: 6,
    background: "transparent",
    className: "fixed inset-0 w-full h-full z-0",
  });
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef);

  // Handle hash navigation on page load
  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # from the hash to get the element ID
      const elementId = hash.substring(1);
      // Use setTimeout to ensure the DOM is fully rendered
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <main>
      {/* <canvas {...canvasProps}></canvas> */}

      <Navigation />

      <HomeHero ref={heroRef} />
      <ModelProvider>
        <HomeModels />
      </ModelProvider>
      <HomeCasting />
      <HomeContact />
    </main>
  );
};

export default Homepage;
