import { useState, useEffect, useCallback } from "react";
import { useModelContext } from "../contexts/ModelContext";
import { decodeHtmlEntities } from "../utils/htmlUtils";
import { FaTimes, FaInstagram, FaYoutube, FaFacebook } from "react-icons/fa";

const ModelPopup = ({ model, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const { categories } = useModelContext();

  // Get ethnicity name from ID
  const getEthnicityName = (ethnicityId) => {
    const ethnicity = categories.find((cat) => cat.id === ethnicityId);
    return ethnicity ? decodeHtmlEntities(ethnicity.name) : "";
  };

  // Set initial selected image and trigger fade in
  useEffect(() => {
    if (model?.gallery && model.gallery.length > 0) {
      setSelectedImage(model.gallery[0]);
    }
    // Trigger fade in animation
    setTimeout(() => setIsVisible(true), 10);
  }, [model]);

  // Handle close with fade out
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Match fade out duration
  }, [onClose]);

  // Close on click outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [handleClose]);

  if (!model) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        p-4 md:p-8
        transition-opacity duration-300
        ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-2xl relative p-4 md:p-8 w-full md:w-auto md:min-w-[66%] max-w-[95vw] max-h-[90vh] overflow-y-auto md:overflow-visible gap-4 md:gap-2">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 md:top-4 md:right-4 text-red-500 text-2xl p-2 z-10"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Left side - Image gallery */}
        <div
          className={
            model.gallery && model.gallery.length > 1
              ? "w-full md:w-4/10"
              : "w-full md:w-5/10"
          }
        >
          {selectedImage && (
            <img
              src={selectedImage.large}
              alt={selectedImage.alt || model.title.rendered}
              className="w-full aspect-[3/4] object-cover max-h-[50vh] md:max-h-[80vh]"
              loading="lazy"
            />
          )}
        </div>

        {/* Thumbnail gallery - Displayed only if there are more than 1 image. */}
        {model.gallery && model.gallery.length > 1 && (
          <div className="w-full md:w-1/10 max-h-[20vh] md:max-h-[80vh] overflow-x-auto md:overflow-y-auto md:overflow-x-hidden">
            <div className="flex flex-row md:flex-col gap-2">
              {model.gallery.map((image) => (
                <img
                  key={image.id}
                  src={image.thumbnail}
                  alt={image.alt}
                  className={`aspect-[3/4] object-cover w-16 md:w-20 transition duration-300 cursor-pointer flex-shrink-0 ${
                    selectedImage?.id === image.id
                      ? "shadow-md scale-95"
                      : ""
                  }`}
                  onClick={() => setSelectedImage(image)}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Right side - Model details */}
        <div className="w-full md:w-5/10 flex flex-col">
          <div className="text-3xl md:text-5xl font-semibold flex flex-wrap items-center gap-2">
            {decodeHtmlEntities(model.title.rendered)}
            {model.acf.in_town && (
              <span className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded">
                In Town
              </span>
            )}
          </div>

          {/* Social media icons */}
          <div className="flex gap-3 my-4">
            {model.acf.instagram && (
              <a
                href={`https://instagram.com/${model.acf.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl md:text-2xl hover:opacity-70 transition-opacity p-1"
                aria-label="Instagram"
              >
                <FaInstagram />
              </a>
            )}
            {model.acf.youtube && (
              <a
                href={model.acf.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl md:text-2xl hover:opacity-70 transition-opacity p-1"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            )}
            {model.acf.facebook && (
              <a
                href={model.acf.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-3xl md:text-2xl hover:opacity-70 transition-opacity p-1"
                aria-label="Facebook"
              >
                <FaFacebook />
              </a>
            )}
          </div>

          {/* Gender & Ethnicity */}
          <p className="text-lg mb-4 font-semibold">
            {[model.acf.gender, getEthnicityName(model.acf.ethnicity)]
              .filter(Boolean)
              .join(" / ")}
          </p>

          {/* Measurements grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
            {/* Left column */}
            <div>
              {model.acf.height && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Height</p>
                  <p className="text-lg">{model.acf.height}</p>
                </div>
              )}
              {model.acf.bust && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Bust</p>
                  <p className="text-lg">{model.acf.bust}</p>
                </div>
              )}
              {model.acf.chest && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Chest</p>
                  <p className="text-lg">{model.acf.chest}</p>
                </div>
              )}
              {model.acf.waist && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Waist</p>
                  <p className="text-lg">{model.acf.waist}</p>
                </div>
              )}
              {model.acf.hip && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Hip</p>
                  <p className="text-lg">{model.acf.hip}</p>
                </div>
              )}
              {model.acf.collar && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Collar</p>
                  <p className="text-lg">{model.acf.collar}</p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              {model.acf.dress && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Dress</p>
                  <p className="text-lg">{model.acf.dress}</p>
                </div>
              )}
              {model.acf.suit && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Suit</p>
                  <p className="text-lg">{model.acf.suit}</p>
                </div>
              )}
              {model.acf.shoe_size && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Shoe Size</p>
                  <p className="text-lg">{model.acf.shoe_size}</p>
                </div>
              )}
              {model.acf.eye_colour && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Eye Colour</p>
                  <p className="text-lg">{model.acf.eye_colour}</p>
                </div>
              )}
              {model.acf.hair_colour && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 font-semibold">Hair Colour</p>
                  <p className="text-lg">{model.acf.hair_colour}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ModelPopup;
