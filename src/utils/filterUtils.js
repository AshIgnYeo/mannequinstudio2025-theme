/**
 * Check if a filter value is currently active
 * @param {string|number} activeValue - The currently active filter value
 * @param {string|number} compareValue - The value to compare against
 * @returns {string} - Returns "active" if values match, empty string otherwise
 */
export const isFilterActive = (activeValue, compareValue) => {
  return activeValue === compareValue ? "active" : "";
};

/**
 * Filter models by gender
 * @param {Array} models - Array of model objects
 * @param {string} gender - Gender to filter by ("all", "Male", "Female")
 * @returns {Array} - Filtered models array
 */
export const filterByGender = (models, gender) => {
  if (gender === "all") return models;
  return models.filter((model) => model.acf.gender === gender);
};

/**
 * Filter models by ethnicity
 * @param {Array} models - Array of model objects
 * @param {string|number} ethnicity - Ethnicity value to filter by ("all" or ethnicity value)
 * @returns {Array} - Filtered models array
 */
export const filterByEthnicity = (models, ethnicity) => {
  if (ethnicity === "all") return models;
  return models.filter((model) => model.acf.ethnicity === ethnicity);
};

/**
 * Filter models by in-town status
 * @param {Array} models - Array of model objects
 * @param {string} inTown - In-town status to filter by ("all", "yes", "no")
 * @returns {Array} - Filtered models array
 */
export const filterByInTown = (models, inTown) => {
  if (inTown === "all") return models;
  return models.filter((model) => model.acf.in_town === (inTown === "yes"));
};
