import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [measurementLabels, setMeasurementLabels] = useState([]);
  const [models, setModels] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch measurement labels from the REST API
  useEffect(() => {
    const fetchMeasurementLabels = async () => {
      const response = await fetch(
        getApiUrl("/wp-json/mannequin-studio/v1/measurement-labels")
      );

      const labels = await response.json();

      const measurementLabels = labels.reduce((acc, label) => {
        acc[label.name.toLowerCase()] = label;
        return acc;
      }, {});
      setMeasurementLabels(measurementLabels);
    };

    fetchMeasurementLabels();
  }, []);

  /**
   * Fetch the models
   */
  useEffect(() => {
    const fetchModels = async () => {
      const allModels = [];
      let page = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await fetch(
          getApiUrl(`/wp-json/wp/v2/models?per_page=10&page=${page}&_embed`)
        );

        const modelsData = await response.json();
        allModels.push(...modelsData);

        const totalPages = parseInt(
          response.headers.get("X-WP-TotalPages") || "1"
        );
        hasMorePages = page < totalPages;
        page++;
      }

      setModels(allModels);
    };

    fetchModels();
  }, []);

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
   * Returns the measurement label
   * @param {String} statKey stat key
   * @returns {String} measurement label
   */
  const getMeasurementLabel = (statKey) => {
    return measurementLabels[statKey]?.unit || "cm";
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
        {getMeasurementLabel(statKey)}
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
  };

  return (
    <ModelContext.Provider value={value}>{children}</ModelContext.Provider>
  );
};

export default ModelContext;
