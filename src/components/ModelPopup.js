import { useState, useEffect } from "react";
import { useModelContext } from "../contexts/ModelContext";
import { decodeHtmlEntities } from "../utils/htmlUtils";
import { FaTimes, FaLongArrowAltRight, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import ButtonPrimary from "./ButtonPrimary";
import ButtonSecondary from "./ButtonSecondary";

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
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300); // Match fade out duration
  };

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
  }, []);

  if (!model) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        transition-opacity duration-300
        ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(4px)",
      }}
      onClick={handleBackdropClick}
    >
      <div className="flex bg-white rounded-lg shadow-2xl relative p-8 min-w-2/3 gap-2">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-red-500 text-2xl"
          aria-label="Close"
        >
          <FaTimes />
        </button>

        {/* Left side - Image gallery */}
        <div
          className={
            model.gallery && model.gallery.length > 1 ? "w-4/10" : "w-5/10"
          }
        >
          {selectedImage && (
            <img
              src={selectedImage.large}
              alt={selectedImage.alt || model.title.rendered}
              className="w-full aspect-[3/4] object-cover max-h-[80vh]"
            />
          )}
        </div>

        {/* Thumbnail gallery - Displayed only if there are more than 1 image. */}
        {model.gallery && model.gallery.length > 1 && (
          <div className="w-1/10">
            <div className="flex flex-col gap-2">
              {model.gallery && model.gallery.length > 1 && (
                <>
                  {model.gallery.map((image) => (
                    <img
                      key={image.id}
                      src={image.thumbnail}
                      alt={image.alt}
                      className={`aspect-[3/4] object-cover w-20 transition duration-300 ${
                        selectedImage?.id === image.id
                          ? "shadow-md scale-95"
                          : ""
                      }`}
                      onClick={() => setSelectedImage(image)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Right side - Model details */}
        <div className="w-5/10 flex flex-col">
          <div className="text-5xl font-semibold flex items-center gap-2">
            {decodeHtmlEntities(model.title.rendered)}
            {model.acf.in_town && (
              <span className="bg-purple-200 text-purple-800 text-sm px-3 py-1 rounded">
                In Town
              </span>
            )}
          </div>

          {/* Social media icons */}
          <div className="flex gap-3 my-2">
            {model.acf.instagram && (
              <a
                href={`https://instagram.com/${model.acf.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:opacity-70 transition-opacity"
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
                className="text-2xl hover:opacity-70 transition-opacity"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>
            )}
            {model.acf.tiktok && (
              <a
                href={model.acf.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:opacity-70 transition-opacity"
                aria-label="TikTok"
              >
                <FaTiktok />
              </a>
            )}
          </div>

          {/* Ethnicity */}
          <p className="text-lg mb-4">
            {getEthnicityName(model.acf.ethnicity)}
          </p>

          {/* Measurements grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
            {/* Left column */}
            <div>
              {model.acf.height && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="text-lg">{model.acf.height}cm</p>
                </div>
              )}
              {model.acf.waist && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Waist</p>
                  <p className="text-lg">{model.acf.waist}"</p>
                </div>
              )}
              {model.acf.shoe_size && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Shoe Size</p>
                  <p className="text-lg">{model.acf.shoe_size}</p>
                </div>
              )}
              {model.acf.eye_colour && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Eye Colour</p>
                  <p className="text-lg">{model.acf.eye_colour}</p>
                </div>
              )}
            </div>

            {/* Right column */}
            <div>
              {model.acf.bust && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Bust</p>
                  <p className="text-lg">{model.acf.bust}"</p>
                </div>
              )}
              {model.acf.hip && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Hip</p>
                  <p className="text-lg">{model.acf.hip}"</p>
                </div>
              )}
              {model.acf.dress && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Dress</p>
                  <p className="text-lg">{model.acf.dress}"</p>
                </div>
              )}
              {model.acf.hair_colour && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500">Hair Colour</p>
                  <p className="text-lg">{model.acf.hair_colour}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-auto justify-end">
            <ButtonSecondary>Add to collection</ButtonSecondary>
            <ButtonPrimary>
              Request {decodeHtmlEntities(model.title.rendered)}{" "}
              <FaLongArrowAltRight />
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPopup;
