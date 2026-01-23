import { useState, useEffect } from "react";
import { useModelContext } from "../contexts/ModelContext";
import { getApiUrl } from "../utils/config";

const ModelCard = ({ model, modelCardSize, onCardClick }) => {
  const [image, setImage] = useState(null);
  const { modelStats } = useModelContext();

  const featuredMediaUrl = model.featured_media
    ? getApiUrl(`/wp-json/wp/v2/media/${model.featured_media}`)
    : null;

  const getImageSize = (size) => {
    return image.media_details.sizes[size].source_url;
  };

  const getImageAlt = () => {
    return image.alt;
  };

  useEffect(() => {
    const fetchImg = async () => {
      const response = await fetch(featuredMediaUrl);
      const data = await response.json();

      setImage(data);
    };

    featuredMediaUrl && fetchImg();
  }, [featuredMediaUrl]);

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

  return (
    <div
      className="flex flex-col items-center justify-center p-2 w-full"
      style={containerStyle}
    >
      <a className="w-full cursor-pointer" onClick={handleClick}>
        <div className="w-full relative overflow-hidden group shadow-lg">
          {image && (
            <img
              src={getImageSize("medium")}
              alt={getImageAlt()}
              className="w-full aspect-[3/4] object-cover group-hover:scale-110 transition-all duration-300"
            />
          )}
          <div
            className="
          absolute pointer-events-none inset-0 bg-black/50
          flex flex-col items-center justify-center
          opacity-0 scale-150
          group-hover:scale-100 group-hover:opacity-100
          transition-all duration-300"
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
