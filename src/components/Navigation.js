import { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";

const Navigation = ({ visible }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverLink, setHoverLink] = useState(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

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

  useEffect(() => {
    window.addEventListener("keyup", (e) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    return () => {
      window.removeEventListener("keyup", (e) => {
        if (e.key === "Escape") {
          closeMenu();
        }
      });
    };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);

  const styles = {
    menuButton: {
      position: "fixed",
      top: "3rem",
      right: "3rem",
      zIndex: 200,
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0.5rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      width: "3rem",
      height: "3rem",
      outline: "none",
    },
    hamburgerLine: {
      width: "4rem",
      height: "2px",
      backgroundColor: "var(--color-primary)",
      margin: "3px 0",
      transition: "all 0.3s ease",
      transformOrigin: "center",
    },
    hamburgerLine1: {
      width: "4rem",
      height: "2px",
      backgroundColor: "var(--color-primary)",
      margin: "3px 0",
      transition: "all 0.3s ease",
      transformOrigin: "center",
      transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
    },
    hamburgerLine2: {
      width: "4rem",
      height: "2px",
      backgroundColor: "var(--color-primary)",
      margin: "3px 0",
      transition: "all 0.3s ease",
      transformOrigin: "center",
      opacity: menuOpen ? 0 : 1,
    },
    hamburgerLine3: {
      width: "4rem",
      height: "2px",
      backgroundColor: "var(--color-primary)",
      margin: "3px 0",
      transition: "all 0.3s ease",
      transformOrigin: "center",
      transform: menuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
    },
    container: {
      position: "fixed",
      top: 0,
      right: 0,
      zIndex: 100,
      background:
        "linear-gradient(to left, rgba(255, 255, 255, 1) 0%,rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0.1) 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backdropFilter: "blur(3px)",
      transform: menuOpen ? "scale(1)" : "scale(1.5)",
      opacity: menuOpen ? 1 : 0,
      pointerEvents: menuOpen ? "auto" : "none",
      transition: "all 0.3s ease",
      transformOrigin: "center",
    },
    wrapper: {
      display: "flex",
      flexDirection: "column",
      marginLeft: "auto",
      padding: "0 2rem",
      width: "40%",
    },
    link: {
      color: "var(--color-primary)",
      textDecoration: "none",
      fontSize: "5rem",
      transition: "all 0.3s ease",
      transitionDelay: menuOpen ? "0.1s" : "0s",
    },
  };

  return (
    <>
      <button style={styles.menuButton} onClick={toggleMenu}>
        <div style={styles.hamburgerLine1}></div>
        <div style={styles.hamburgerLine2}></div>
        <div style={styles.hamburgerLine3}></div>
      </button>
      <AnimatePresence
        present={visible}
        initial={false}
        mode="wait"
        exitBeforeEnter
      >
        <div style={styles.container}>
          <div style={styles.wrapper}>
            <a
              style={styles.link}
              href="/"
              onClick={closeMenu}
              onMouseEnter={() => setHoverLink("home")}
              onMouseLeave={() => setHoverLink(null)}
            >
              Home
            </a>
            <a
              style={styles.link}
              href="/about"
              onClick={closeMenu}
              onMouseEnter={() => setHoverLink("about")}
              onMouseLeave={() => setHoverLink(null)}
            >
              About
            </a>
            <a
              style={styles.link}
              href="/models"
              onClick={closeMenu}
              onMouseEnter={() => setHoverLink("models")}
              onMouseLeave={() => setHoverLink(null)}
            >
              Models
            </a>
            <a
              style={styles.link}
              href="/casting"
              onClick={closeMenu}
              onMouseEnter={() => setHoverLink("casting")}
              onMouseLeave={() => setHoverLink(null)}
            >
              Casting
            </a>
            <a
              style={styles.link}
              href="/#contact"
              onClick={handleContactClick}
              onMouseEnter={() => setHoverLink("contact")}
              onMouseLeave={() => setHoverLink(null)}
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
