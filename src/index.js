import React from "react";
import ReactDOM from "react-dom/client";
import Homepage from "./components/Homepage";
import Page from "./components/Page";
import Single from "./components/Single";
import Models from "./components/Models/Models";
import About from "./components/About/About";
import Casting from "./components/Casting/Casting";
import { ModelProvider } from "./contexts/ModelContext";

const rootSelectors = [
  {
    root: "#homepage",
    Component: Homepage,
  },
  {
    root: "#models",
    Component: Models,
  },
  {
    root: "#about",
    Component: About,
  },
  {
    root: "#casting",
    Component: Casting,
  },
  {
    root: "#single",
    Component: Single,
  },
];

let componentRendered = false;

rootSelectors.forEach(({ root, Component }) => {
  const element = document.querySelector(root);
  if (element) {
    const rootElement = ReactDOM.createRoot(element);

    // Wrap Models component with ModelProvider
    if (Component === Models) {
      rootElement.render(
        <ModelProvider>
          <Component />
        </ModelProvider>
      );
    } else {
      rootElement.render(<Component />);
    }

    componentRendered = true;
  }
});

// Fallback: Load Page component for unrecognized pages
// This handles pages that don't have specific components (e.g., generic WordPress pages)
if (!componentRendered) {
  // Find all divs directly in body that aren't WordPress admin elements
  const bodyDivs = document.querySelectorAll("body > div");
  const contentDiv = Array.from(bodyDivs).find(
    (div) => !div.id.includes("wpadmin") && div.id !== ""
  );

  if (contentDiv) {
    const rootElement = ReactDOM.createRoot(contentDiv);
    rootElement.render(<Page />);
  }
}
