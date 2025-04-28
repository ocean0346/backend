/**
 * Async handler to wrap async route handlers
 * @param {Function} fn The async function to wrap
 * @returns {Function} The middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler; 