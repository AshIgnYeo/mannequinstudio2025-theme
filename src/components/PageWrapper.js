import Navigation from "./Navigation";
import { decodeHtmlEntities } from "../utils/htmlUtils";

const PageWrapper = ({ children, title }) => {
  return (
    <div className="container mx-auto pt-5">
      <Navigation />
      <h1 className="text-8xl font-bold">{decodeHtmlEntities(title)}</h1>
      {children}
    </div>
  );
};

export default PageWrapper;
