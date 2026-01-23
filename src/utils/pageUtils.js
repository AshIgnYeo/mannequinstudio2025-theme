import { getApiUrl } from "./config";

/**
 * Get the current page slug from the URL path
 * @returns {string} The page slug
 */
export const getPageSlug = () => {
  const path = window.location.pathname;
  return path === "/" ? "home" : path.replace(/\//g, "");
};

/**
 * Fetch page data from WordPress API
 * @param {string} slug - The page slug to fetch
 * @returns {Promise<Object>} The page data
 * @throws {Error} If the request fails
 */
export const fetchPageData = async (slug) => {
  const response = await fetch(getApiUrl(`/wp-json/wp/v2/pages?slug=${slug}`));

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const [pageData] = await response.json();
  return pageData;
};

/**
 * Fetch page data
 * @param {string} slug - The page slug to fetch (optional, defaults to current page slug)
 * @returns {Promise<{error: boolean, content: string|Object}>} Object with error status and content
 */
export const fetchPage = async (slug = null) => {
  try {
    const pageSlug = slug || getPageSlug();
    const pageData = await fetchPageData(pageSlug);
    return { error: false, content: pageData };
  } catch (error) {
    console.error("Error fetching page:", error);
    return { error: true, content: error.message };
  }
};
