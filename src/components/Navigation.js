import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "motion/react";

const Navigation = ({ visible }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverLink, setHoverLink] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleContactClick = (e) => {
    // If we're already on the homepage, just scroll to contact section
    if (window.location.pathname === "/") {
      e.preventDefault();
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Always close menu when clicking
    closeMenu();
  };

  // Fixed memory leak: use stable function reference
  const handleKeyUp = useCallback((e) => {
    if (e.key === "Escape") {
      closeMenu();
    }
  }, [closeMenu]);

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyUp]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  // Handle touch events for mobile
  const handleLinkInteraction = (linkName, isActive) => {
    setHoverLink(isActive ? linkName : null);
  };

  return (
    <>
      <button
        className="fixed top-4 right-4 md:top-12 md:right-12 z-[200] bg-transparent border-none cursor-pointer p-2 flex flex-col justify-center items-center w-12 h-12 outline-none"
        onClick={toggleMenu}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <div
          className="w-10 md:w-16 h-0.5 bg-primary my-[3px] transition-all duration-300 origin-center"
          style={{
            transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
          }}
        ></div>
        <div
          className="w-10 md:w-16 h-0.5 bg-primary my-[3px] transition-all duration-300 origin-center"
          style={{
            opacity: menuOpen ? 0 : 1,
          }}
        ></div>
        <div
          className="w-10 md:w-16 h-0.5 bg-primary my-[3px] transition-all duration-300 origin-center"
          style={{
            transform: menuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
          }}
        ></div>
      </button>
      <AnimatePresence
        present={visible}
        initial={false}
        mode="wait"
        exitBeforeEnter
      >
        <div
          className={`
            fixed top-0 right-0 z-[100]
            flex justify-center items-center
            h-screen w-screen
            backdrop-blur-sm
            transition-all duration-300
            ${menuOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-150 opacity-0 pointer-events-none"}
          `}
          style={{
            background:
              "linear-gradient(to left, rgba(255, 255, 255, 1) 0%,rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.1) 100%)",
            transformOrigin: "center",
          }}
        >
          <div className="flex flex-col ml-auto px-4 md:px-8 w-full md:w-2/5">
            <a
              className="text-primary no-underline text-3xl md:text-5xl lg:text-[5rem] transition-all duration-300 py-2"
              style={{ transitionDelay: menuOpen ? "0.1s" : "0s" }}
              href="/"
              onClick={closeMenu}
              onMouseEnter={() => handleLinkInteraction("home", true)}
              onMouseLeave={() => handleLinkInteraction("home", false)}
              onTouchStart={() => handleLinkInteraction("home", true)}
              onTouchEnd={() => handleLinkInteraction("home", false)}
            >
              Home
            </a>
            <a
              className="text-primary no-underline text-3xl md:text-5xl lg:text-[5rem] transition-all duration-300 py-2"
              style={{ transitionDelay: menuOpen ? "0.1s" : "0s" }}
              href="/about"
              onClick={closeMenu}
              onMouseEnter={() => handleLinkInteraction("about", true)}
              onMouseLeave={() => handleLinkInteraction("about", false)}
              onTouchStart={() => handleLinkInteraction("about", true)}
              onTouchEnd={() => handleLinkInteraction("about", false)}
            >
              About
            </a>
            <a
              className="text-primary no-underline text-3xl md:text-5xl lg:text-[5rem] transition-all duration-300 py-2"
              style={{ transitionDelay: menuOpen ? "0.1s" : "0s" }}
              href="/models"
              onClick={closeMenu}
              onMouseEnter={() => handleLinkInteraction("models", true)}
              onMouseLeave={() => handleLinkInteraction("models", false)}
              onTouchStart={() => handleLinkInteraction("models", true)}
              onTouchEnd={() => handleLinkInteraction("models", false)}
            >
              Models
            </a>
            <a
              className="text-primary no-underline text-3xl md:text-5xl lg:text-[5rem] transition-all duration-300 py-2"
              style={{ transitionDelay: menuOpen ? "0.1s" : "0s" }}
              href="/#contact"
              onClick={handleContactClick}
              onMouseEnter={() => handleLinkInteraction("contact", true)}
              onMouseLeave={() => handleLinkInteraction("contact", false)}
              onTouchStart={() => handleLinkInteraction("contact", true)}
              onTouchEnd={() => handleLinkInteraction("contact", false)}
            >
              Contact
            </a>
          </div>
        </div>
      </AnimatePresence>
    </>
  );
};

export default Navigation;
