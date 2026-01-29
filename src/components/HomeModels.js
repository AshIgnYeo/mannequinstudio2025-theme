import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { useModelContext } from "../contexts/ModelContext";
import HomeModelsRow from "./HomeModelsRow";
import { BsArrowRight } from "react-icons/bs";
import {
  isFilterActive,
  filterByGender,
  filterByEthnicity,
} from "../utils/filterUtils";
import { decodeHtmlEntities } from "../utils/htmlUtils";
import ModelPopup from "./ModelPopup";

const HomeModels = () => {
  const modelsContainerRef = useRef(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { categories, models } = useModelContext();
  const [activeGender, setActiveGender] = useState("all");
  const [activeEthnicity, setActiveEthnicity] = useState("all");
  const [modelCardSize, setModelCardSize] = useState(0);
  const [selectedModel, setSelectedModel] = useState(null);

  /**
   * Calculate the model card size
   * card size should be 1/6 of the container width
   */
  const calculateModelCardSize = () => {
    const containerWidth = modelsContainerRef.current.offsetWidth;
    const totalCards = containerWidth > 800 ? 5 : 3;
    const cardWidth = containerWidth / totalCards;

    setModelCardSize(cardWidth);
  };

  /**
   * Calculate the model card size when the container is loaded
   * recalculate the model card size when the container is resized
   */
  useEffect(() => {
    calculateModelCardSize();
    window.addEventListener("resize", calculateModelCardSize);

    return () => {
      window.removeEventListener("resize", calculateModelCardSize);
    };
  }, [modelsContainerRef.current]);

  // Memoize filtered models to prevent unnecessary re-renders
  const filteredModels = useMemo(() => {
    let filtered = filterByGender(models, activeGender);
    filtered = filterByEthnicity(filtered, activeEthnicity);
    return filtered;
  }, [activeGender, activeEthnicity, models]);

  return (
    <div
      ref={sectionRef}
      className="container mx-auto relative min-h-screen flex justify-center items-center"
    >
      <div className="w-full">
        <motion.div
          className="flex w-full justify-between flex-row-reverse items-center"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <a href="/models">
            <h2 className="text-7xl group flex items-center justify-between">
              All Models
              <BsArrowRight className="ml-5 -translate-x-5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300" />
            </h2>
          </a>
          <div className="model-gender-filter flex items-center">
            <a
              className={`mx-2 cursor-pointer ${isFilterActive(
                activeGender,
                "Female",
              )}`}
              onClick={() => setActiveGender("Female")}
            >
              WOMEN
            </a>
            <a
              className={`mx-2 cursor-pointer ${isFilterActive(
                activeGender,
                "Male",
              )}`}
              onClick={() => setActiveGender("Male")}
            >
              MEN
            </a>
            <a
              className={`mx-2 cursor-pointer ${isFilterActive(
                activeGender,
                "all",
              )}`}
              onClick={() => setActiveGender("all")}
            >
              ALL
            </a>
            <span className="mx-2 text-lg">({filteredModels.length})</span>
          </div>
        </motion.div>

        <div className="flex">
          {/* ethnicity filter container */}
          <motion.div
            className="w-1/4"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            <div className="model-ethnicity-filter flex flex-col gap-2 mx-3 my-5">
              <a
                className={`text-xl cursor-pointer ${isFilterActive(
                  activeEthnicity,
                  "all",
                )}`}
                onClick={() => setActiveEthnicity("all")}
              >
                All
              </a>

              {categories.map((category) => (
                <a
                  key={category.id}
                  className={`text-xl cursor-pointer ${isFilterActive(
                    activeEthnicity,
                    category.id,
                  )}`}
                  onClick={() => setActiveEthnicity(category.id)}
                >
                  {decodeHtmlEntities(category.name)}
                </a>
              ))}
            </div>
          </motion.div>
          {/* models container */}
          <motion.div
            className="w-3/4 overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={
              isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
            }
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <div className="overflow-x-auto relative" ref={modelsContainerRef}>
              <div className="relative overflow-y-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeGender}-${activeEthnicity}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      transformOrigin: "center center",
                      willChange: "transform, opacity",
                    }}
                  >
                    {/* Get only the first 10 on the homepage */}
                    <HomeModelsRow
                      models={filteredModels.slice(0, 10)}
                      modelCardSize={modelCardSize}
                      onCardClick={setSelectedModel}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Model Popup */}
      {selectedModel && (
        <ModelPopup
          model={selectedModel}
          onClose={() => setSelectedModel(null)}
        />
      )}
    </div>
  );
};

export default HomeModels;
