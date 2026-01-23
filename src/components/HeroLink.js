import { motion } from "motion/react";
import { BsArrowRight } from "react-icons/bs";

const HeroLink = ({ link, delay, setHoverLink }) => {
  return (
    <motion.a
      href={`/${link}`}
      className={`text-8xl flex items-center group`}
      //set hover
      onMouseEnter={() => setHoverLink("models")}
      onMouseLeave={() => setHoverLink(null)}
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
      <BsArrowRight className="pl-5 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
    </motion.a>
  );
};

export default HeroLink;
