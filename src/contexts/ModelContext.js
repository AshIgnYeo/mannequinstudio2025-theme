import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getApiUrl } from "../utils/config";

/**
 * ModelContext
 * @type {React.Context}
 */
const ModelContext = createContext();

/**
 * useModelContext hook
 * @returns {Object} ModelContext object
 */
export const useModelContext = () => {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModelContext must be used within a ModelProvider");
  }
  return context;
};

/**
 * ModelProvider component
 * @param {React.ReactNode} param0.children children
 * @returns {React.ReactNode} ModelProvider component
 */
export const ModelProvider = ({ children }) => {
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  /**
   * Fetch the initial page of models
   */
  useEffect(() => {
    const fetchInitialModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch(
          getApiUrl(`/wp-json/wp/v2/models?per_page=20&page=1&_embed`)
        );
        const data = await response.json();
        const total = parseInt(response.headers.get("X-WP-TotalPages") || "1");

        setModels(data);
        setTotalPages(total);
        setHasMore(1 < total);
      } catch (error) {
        console.error("Error fetching models:", error);
      }
      setIsLoadingModels(false);
    };

    fetchInitialModels();
  }, []);

  /**
   * Load more models (for infinite scroll)
   */
  const loadMoreModels = useCallback(async () => {
    if (!hasMore || isLoadingModels) return;

    setIsLoadingModels(true);
    const nextPage = currentPage + 1;

    try {
      const response = await fetch(
        getApiUrl(`/wp-json/wp/v2/models?per_page=20&page=${nextPage}&_embed`)
      );
      const data = await response.json();

      setModels((prev) => [...prev, ...data]);
      setCurrentPage(nextPage);
      setHasMore(nextPage < totalPages);
    } catch (error) {
      console.error("Error loading more models:", error);
    }
    setIsLoadingModels(false);
  }, [hasMore, isLoadingModels, currentPage, totalPages]);

  /**
   * Fetch the categories (ethnicities)
   */
  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch(getApiUrl("/wp-json/wp/v2/categories"));

      const categories = await response.json();
      const ethnicities = categories.filter((category) => category.id != 1);

      setCategories(ethnicities);
    };

    fetchCategories();
  }, []);

  /**
   * Gender validation for stats
   * prevents showing stats for certain genders
   */
  const genderValidaton = {
    male: ["bust", "hip", "dress"],
    female: ["chest", "collar", "suit"],
  };

  /**
   * Converts a string to lower snake case
   * @param {String} str string to convert
   * @returns {String} lower snake case string
   */
  const toLowerSnakeCase = (str) => {
    return str.toLowerCase().replace(/ /g, "_");
  };

  /**
   * Returns the model stats
   * @param {Object} model model object
   * @param {String} stat stat name
   * @returns
   */
  const modelStats = (model, stat) => {
    const statKey = toLowerSnakeCase(stat);
    const genderKey = model.acf.gender.toLowerCase();

    if (genderValidaton[genderKey].includes(statKey)) return;
    if (!model.acf[statKey]) return;

    return (
      <div className="text-white">
        <strong>{stat}:</strong> {model.acf[statKey]}
      </div>
    );
  };

  /**
   * values to be sent to the ModelProvider
   */
  const value = {
    models,
    modelStats,
    categories,
    isLoadingModels,
    hasMore,
    loadMoreModels,
  };

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
};

export default ModelContext;
