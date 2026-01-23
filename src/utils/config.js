/**
 * Configuration utility for development mode detection
 * Provides centralized base URL management for the entire theme
 */

/**
 * Check if we're in development mode
 * @returns {boolean} true if in development mode
 */
export const isDev = () => {
  return (
    process.env.NODE_ENV === "development" ||
    window.location.hostname === "localhost"
  );
};

/**
 * Get the base URL for API calls
 * @returns {string} base URL for API calls
 */
export const getBaseUrl = () => {
  return isDev() ? "http://localhost:10008" : "";
};

/**
 * Get the full API URL for a given endpoint
 * @param {string} endpoint - API endpoint (e.g., '/wp-json/wp/v2/pages')
 * @returns {string} full API URL
 */
export const getApiUrl = (endpoint) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${endpoint}`;
};
