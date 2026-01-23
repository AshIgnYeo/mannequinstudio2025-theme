import { useState } from "react";
import { useModelContext } from "../contexts/ModelContext";

const ModelCard = ({ model, modelCardSize, onCardClick }) => {
  const { modelStats } = useModelContext();
  const [isActive, setIsActive] = useState(false);

  // Get embedded featured media (no API call needed - already fetched with _embed)
  const image = model._embedded?.["wp:featuredmedia"]?.[0] || null;

  const getImageSize = (size) => {
    return image?.media_details?.sizes?.[size]?.source_url;
  };

  const getImageAlt = () => {
    return image?.alt_text || "";
  };

  // Style for fixed size (homepage) vs responsive (models page)
  const containerStyle = modelCardSize
    ? { width: modelCardSize, height: modelCardSize * 1.5 }
    : {};

  const handleClick = (e) => {
    e.preventDefault();
    if (onCardClick) {
      onCardClick(model);
    }
  };

  // Touch event handlers for mobile overlay
  const handleTouchStart = () => {
    setIsActive(true);
  };

  const handleTouchEnd = () => {
    // Keep overlay visible briefly so user can see stats
    setTimeout(() => setIsActive(false), 2000);
  };

  return (
    <div
      className="flex flex-col items-center justify-center p-2 w-full"
      style={containerStyle}
    >
      <a className="w-full cursor-pointer" onClick={handleClick}>
        <div
          className="w-full relative overflow-hidden group shadow-lg"
          onMouseEnter={() => setIsActive(true)}
          onMouseLeave={() => setIsActive(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {image && (
            <img
              src={getImageSize("medium")}
              alt={getImageAlt()}
              className={`w-full aspect-[3/4] object-cover transition-all duration-300 ${
                isActive ? "scale-110" : ""
              }`}
              loading="lazy"
            />
          )}
          <div
            className={`
              absolute pointer-events-none inset-0 bg-black/50
              flex flex-col items-center justify-center
              transition-all duration-300
              ${isActive ? "scale-100 opacity-100" : "opacity-0 scale-150"}
            `}
          >
            {modelStats(model, "Height")}
            {modelStats(model, "Bust")}
            {modelStats(model, "Collar")}
            {modelStats(model, "Chest")}
            {modelStats(model, "Waist")}
            {modelStats(model, "Hip")}
            {modelStats(model, "Dress")}
            {modelStats(model, "Suit")}
          </div>
        </div>
      </a>
      <h3 className="mt-2">{model.title.rendered}</h3>
    </div>
  );
};

export default ModelCard;
