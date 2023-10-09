export function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export const isEmpty = (value) =>
  value == null ||
  (typeof value === "string" && value.trim() === "") ||
  (Array.isArray(value) && value.length === 0) ||
  (typeof value === "object" && Object.keys(value).length === 0);

/**
 * Performs a deep merge between the target and source objects.
 *
 * @param {Object} target - The target object.
 * @param {Object} source - The source object.
 */
export function deepMerge(target, source) {
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        source[key] !== null
      ) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else if (Array.isArray(source[key])) {
        target[key] = Array.isArray(target[key])
          ? target[key].concat(source[key])
          : source[key];
      } else {
        target[key] = source[key];
      }
    }
  }
}
