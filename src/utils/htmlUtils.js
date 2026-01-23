/**
 * Decode HTML entities in a string
 * Safely converts &amp; to &, &lt; to <, etc.
 *
 * @param {string} html - String with HTML entities
 * @returns {string} - Decoded string
 */
export const decodeHtmlEntities = (html) => {
  if (!html) return "";

  const textarea = document.createElement("textarea");
  textarea.innerHTML = html;
  return textarea.value;
};
