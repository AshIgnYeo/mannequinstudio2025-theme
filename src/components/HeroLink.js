import { useState } from "react";
import { motion } from "motion/react";
import { BsArrowRight } from "react-icons/bs";

const HeroLink = ({ link, delay, setHoverLink }) => {
  const [isActive, setIsActive] = useState(false);

  const handleInteractionStart = () => {
    setIsActive(true);
    setHoverLink(link);
  };

  const handleInteractionEnd = () => {
    setIsActive(false);
    setHoverLink(null);
  };

  return (
    <motion.a
      href={`/${link}`}
      className="text-4xl md:text-6xl lg:text-8xl flex items-center group"
      onMouseEnter={handleInteractionStart}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      // motion props
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        type: "spring",
        stiffness: 60,
        delay: delay,
      }}
    >
      {link}
      <BsArrowRight
        className={`pl-5 transition-all duration-300 ${
          isActive
            ? "translate-x-0 opacity-100"
            : "-translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
        }`}
      />
    </motion.a>
  );
};

export default HeroLink;
