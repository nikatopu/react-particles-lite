/**
 * Recursively merges two objects. This is used to merge user-defined
 * particle configurations with default settings.
 * @param target Weak object to merge into.
 * @param source Strong object to merge from.
 * @returns A new object that is the result of deeply merging source into target.
 */
export const deepMerge = (target: any, source: any): any => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};
