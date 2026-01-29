import { useState, forwardRef } from "react";
import { motion } from "motion/react";
import HeroLink from "./HeroLink";
import logo from "../images/mannequin-logo.svg";

const HomeHero = forwardRef((props, ref) => {
  const [hoverLink, setHoverLink] = useState(null);

  const hoverAnimation = (link) => {
    if (!hoverLink) {
      return "scale-100";
    }

    if (link === hoverLink) {
      return "scale-110";
    }
    return "scale-90 text-gray-500";
  };

  return (
    <div ref={ref} className="relative w-full h-screen overflow-x-hidden">
      <div className="relative z-10 flex flex-col lg:flex-row h-screen">
        <div className="w-full lg:w-3/5 flex pt-5 pl-4 md:pl-8">
          <motion.img
            src={logo}
            alt="Mannequin"
            initial={{ opacity: 0, x: -200 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 60,
            }}
            className="h-16 md:h-24 lg:h-32 w-auto"
          />
        </div>
        <div className="w-full lg:w-2/5">
          <div className="flex flex-col justify-center gap-4 md:gap-10 h-full px-4 lg:px-0">
            <HeroLink link="models" delay={0.2} setHoverLink={setHoverLink} />
            <HeroLink link="about" delay={0.4} setHoverLink={setHoverLink} />
            <HeroLink link="contact" delay={0.6} setHoverLink={setHoverLink} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default HomeHero;
