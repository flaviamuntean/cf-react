export default class Helpers {
  static generateSpacesDropdown = (spaces) => {
    return spaces.items.map((space) => ({
      key: space.sys.id,
      text: space.name,
      value: space.sys.id,
    }));
  };

  static generateEnvironmentsDropdown = (environments) => {
    return environments.items.map((environment) => ({
      key: environment.sys.id,
      text: environment.sys.id,
      value: environment.sys.id,
    }));
  };

  static generateContentTypesDropdown = (contentTypes) => {
    return contentTypes.items.map((contentType) => ({
      key: contentType.sys.id,
      text: contentType.name,
      value: contentType.sys.id,
    }));
  };

  static generateFieldsDropdown = (selectedFields) => {
    return selectedFields.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
  };

  static generateFiltersDropdown = (response) => {
    return response.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
  };

  static generateFilterValuesDropdown = (uniqueFieldValues) => {
    return uniqueFieldValues.map((value) => ({
      key: value,
      text: value,
      value: value,
    }));
  };

  static generateLocalesDropdown = (locales) => {
    return locales.items.map((locale) => ({
      key: locale.sys.id,
      text: locale.name,
      value: locale.code,
    }));
  };

  static generateAllFieldsDropdown = (uniqueFilterIDs) => {
    return uniqueFilterIDs.map((id) => ({
      key: id,
      text: id,
      value: id,
    }));
  };

  static generateTagsForDropdown = (tags) => {
    return tags.items.map((t) => ({
      key: t.sys.id,
      text: t.name,
      value: t.sys.id,
    }));
  };

  static filterByLocalizable = (response) => {
    return response.filter(
      (field) => field.localized === true && field.type !== "Link"
    );
  };

  static getUniqueFieldValues = (entries, chosenField, sourceLocale) => {
    const fieldValues = entries.items.map(
      (entry) => entry.fields[chosenField] || null
    );
    const fieldValuesArray = fieldValues.map((entry) => {
      if (entry) {
        if (entry[sourceLocale]) {
          return entry[sourceLocale];
        }
      }
      return "";
    });

    return fieldValuesArray
      .flat()
      .filter((v, i) => fieldValuesArray.flat().indexOf(v) === i)
      .filter((v) => v !== "");
  };

  static generateExportOptionsApiQuery = (
    selectedFilterValues,
    selectedFilter
  ) => {
    if (selectedFilterValues.length > 1) {
      return `fields.${selectedFilter}[in]`;
    } else {
      return `fields.${selectedFilter}`;
    }
  };

  static generateExportDefaultApiQuery = (
    allFieldsValues,
    selectedAllFieldsFilter
  ) => {
    if (allFieldsValues.includes(",")) {
      return `fields.${selectedAllFieldsFilter}[in]`;
    } else {
      return `fields.${selectedAllFieldsFilter}`;
    }
  };

  static generateFieldsSelector = (selectedFields) => {
    return selectedFields.map((field) => `fields.${field}`).join(",");
  };

  static generateTagsSelector = (selectedTags) => {
    return selectedTags.join(",");
  };

  static safelyParseJSON(json) {
    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch (e) {
      console.log("error!!");
    }

    return parsed; // Returns undefined if json content is invalid and cannot be parsed
  }

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
