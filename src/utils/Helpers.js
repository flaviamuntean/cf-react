export default class Helpers {
  static subFilter = (object, lang) => {
    return Object.entries(object).reduce((filtered, [key, val]) => {
      if (key === lang) {
        filtered[key] = val;
      }
      return filtered;
    }, {});
  };

  static filterByLang = (object, lang) => {
    return Object.entries(object).reduce((filtered, [key, val]) => {
      // The object param would look like the one below:

      // {
      //   "productName": {
      //     "de-DE": "German name",
      //     "en-US": "English name"
      //   },
      //   "productDescription": {
      //     "de-DE": "German description"
      //   }
      // }

      // For every key-val pair inside, check if the val is an object
      // If it is, check if it contains the source lang as a key
      // If it doesn't contain it, we do not want to return it the sub-object at all
      // So if the source lang is en-US, we would not include productDescription in the final exported object
      // productName however has en-US, so we call subFilter on it, to filter out all languages that are not en-US
      // This means the productName would end up looking like this:

      //   "productName": {
      //     "en-US": "English name"
      //   }

      // And the entire filtered object like this (without the productDescription):

      // {
      //   "productName": {
      //     "en-US": "English name"
      //   }
      // }

      if (
        typeof val === "object" &&
        !Array.isArray(val) &&
        Object.keys(val).includes(lang)
      ) {
        filtered[key] = this.subFilter(val, lang);
      }
      return filtered;
    }, {});
  };
}
