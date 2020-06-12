import React, { Component } from "react";
import AuthDetails from "../AuthDetails/AuthDetails";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";
import Export from "../Export/Export";
import ExportDefault from "../ExportDefault/ExportDefault";
import Import from "../Import/Import";

import { createClient } from "contentful-management";

Object.filter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate));

class Integration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translation: "",
      sourceText: "",
      importLog: "",
      // basic states
      spaces: [],
      selectedSpace: "",
      spaceObject: null,
      environments: [],
      selectedEnvironment: "",
      environmentObject: null,
      // export options
      contentTypes: [],
      selectedContentType: "",
      fields: [],
      selectedFields: [],
      // filters
      filters: [],
      selectedFilter: "",
      filterValues: [],
      selectedFilterValues: [],
      // locales
      locales: [],
      targetLocale: "",
      sourceLocale: "",
      // modals
      openAuthModal: true,
      openSourceTextModal: false,
      openImportLogModal: false,
      //
    };
  }

  componentDidMount() {
    this.getInitialIntegrationDetails();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.spaceID !== this.props.spaceID ||
      prevProps.accessToken !== this.props.accessToken
    ) {
      this.getInitialIntegrationDetails();
    }
  };

  setInitState = () => {
    this.setState({
      spaces: [],
      selectedSpace: "",
      spaceObject: null,
      environments: [],
      selectedEnvironment: "",
      environmentObject: null,
      contentTypes: [],
      selectedContentType: "",
      fields: [],
      selectedFields: [],
      filters: [],
      selectedFilter: "",
      filterValues: [],
      selectedFilterValues: [],
    });
  };

  getInitialIntegrationDetails = () => {
    this.managementClient = createClient({
      accessToken: this.props.accessToken,
    });
    this.getSpaces();
    const cookieData = CookieUtils.readUserStateFromCookies();
    const { space, environment } = cookieData;

    this.setState({ selectedSpace: space, selectedEnvironment: environment });

    if (space) {
      this.managementClient
        .getSpace(space)
        .then((space) => this.setState({ spaceObject: space }));
      this.getEnvironments(space);
    }

    if (space && environment) {
      this.managementClient
        .getSpace(space)
        .then((space) => space.getEnvironment(environment))
        .then((environment) =>
          this.setState({ environmentObject: environment })
        );
      this.getContentTypesAndLocales(space, environment);
    }
  };

  getContentTypesAndLocales = (space, environment) => {
    this.managementClient
      .getSpace(space)
      .then((space) => space.getEnvironment(environment))
      .then((environment) => {
        this.getContentTypes(environment);
        this.getLocales(environment);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Display the first section of the integration
  displayAuthDetails = () => {
    const { openAuthModal } = this.props;
    const {
      spaces,
      environments,
      selectedSpace,
      selectedEnvironment,
    } = this.state;

    return (
      <AuthDetails
        changeToken={openAuthModal}
        spaces={spaces}
        environments={environments}
        selectedSpace={selectedSpace}
        selectedEnvironment={selectedEnvironment}
        handleSpaceSelection={this.handleSpaceSelection}
        handleEnvironmentSelection={this.handleEnvironmentSelection}
      />
    );
  };

  // Get all spaces for the token
  getSpaces = () => {
    this.managementClient
      .getSpaces()
      .then((spaces) => {
        const dropdownCategories = spaces.items.map((space) => ({
          key: space.sys.id,
          text: space.name,
          value: space.sys.id,
        }));
        this.setState({ spaces: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
        // Remove all information on spaces and environments if the spaces are not fetched (most likely due to the token being invalid)
        this.setInitState();
      });
  };

  // Select a space
  handleSpaceSelection = (e, { value }) => {
    this.setState({ selectedSpace: value }, () => {
      const key = `space`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });
    this.setState({
      selectedEnvironment: "",
      sourceLocale: "",
      contentTypes: [],
      selectedContentType: "",
      fields: [],
      selectedFields: [],
      filters: [],
      selectedFilter: "",
      filterValues: [],
      selectedFilterValues: [],
    });
    if (value) {
      console.log(value);
      this.managementClient
        .getSpace(value)
        .then((space) => this.setState({ spaceObject: space }));
      const key = `environment`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, "", expires);
      this.getEnvironments(value);
    }
  };

  // Get environments for the space
  getEnvironments = (space) => {
    this.managementClient
      .getSpace(space)
      .then((space) => space.getEnvironments())
      .then((environments) => {
        const dropdownCategories = environments.items.map((environment) => ({
          key: environment.sys.id,
          text: environment.sys.id,
          value: environment.sys.id,
        }));
        this.setState({ environments: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Select an environment
  handleEnvironmentSelection = (e, { value }) => {
    this.setState({ selectedEnvironment: value }, () => {
      const key = `environment`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });
    this.setState({
      contentTypes: [],
      selectedContentType: "",
      fields: [],
      selectedFields: [],
      filters: [],
      selectedFilter: "",
      filterValues: [],
      selectedFilterValues: [],
    });
    if (value) {
      const { selectedSpace, spaceObject } = this.state;
      spaceObject.getEnvironment(value).then((environment) => {
        this.setState({ environmentObject: environment });
        this.getContentTypesAndLocales(selectedSpace, value);
      });
    }
  };

  // EXPORT OPTIONS

  getContentTypes = (environment) => {
    environment
      .getContentTypes()
      .then((response) => {
        const dropdownCategories = response.items.map((contentType) => ({
          key: contentType.sys.id,
          text: contentType.name,
          value: contentType.sys.id,
        }));
        this.setState({ contentTypes: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  setContentType = (e, { value }) => {
    // Set the content type, but remove the valuses for all the following dropdowns
    this.setState({
      selectedContentType: value,
      fields: [],
      selectedFields: [],
      filters: [],
      selectedFilter: "",
      selectedFilterValues: [],
    });

    if (value) {
      this.getFields(value);
      this.getFilters(value);
    }
  };

  getFields = async (contentType) => {
    const { environmentObject } = this.state;

    const response = await (await environmentObject.getContentType(contentType))
      .fields;
    const selectedFields = response.filter((field) => field.localized === true);
    const dropdownCategories = selectedFields.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
    this.setState({ fields: dropdownCategories });
  };

  setFields = (e, { value }) => {
    this.setState({ selectedFields: value });
  };

  setSourceLocale = (e, { value }) => {
    this.setState({ sourceLocale: value });
  };

  // EXPORT FILTERS

  getFilters = async (contentType) => {
    const { environmentObject } = this.state;

    const response = await (await environmentObject.getContentType(contentType))
      .fields;
    const dropdownCategories = response.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
    this.setState({ filters: dropdownCategories });
  };

  setFilter = (e, { value }) => {
    const { selectedContentType } = this.state;
    // Set the value of the filter, but remove any values that were previously selected for this filter
    this.setState({
      selectedFilter: value,
      selectedFilterValues: [],
    });

    if (value) {
      this.getFilterValues(selectedContentType, value);
    }
  };

  getFilterValues = async (chosenContentType, chosenField) => {
    const { environmentObject, sourceLocale } = this.state;
    const entries = await environmentObject.getEntries({
      content_type: chosenContentType,
    });

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

    const uniqueFieldValues = fieldValuesArray
      .flat()
      .filter((v, i) => fieldValuesArray.flat().indexOf(v) === i)
      .filter((v) => v !== "");

    const dropdownCategories = uniqueFieldValues.map((value) => ({
      key: value,
      text: value,
      value: value,
    }));
    this.setState({ filterValues: dropdownCategories });
  };

  setFilterValues = (e, { value }) => {
    if (value) {
      this.setState({ selectedFilterValues: value });
    } else {
      this.setState({ selectedFilterValues: [] });
    }
  };

  // HANDLE EXPORT

  handleExport = async () => {
    const {
      environmentObject,
      selectedContentType,
      selectedFilterValues,
      selectedFilter,
      sourceLocale,
      selectedFields,
    } = this.state;
    const selectedFilterValuesString = selectedFilterValues.join(",");
    let query;

    if (selectedFilterValues.length > 1) {
      query = `fields.${selectedFilter}[in]`;
    } else {
      query = `fields.${selectedFilter}`;
    }

    let fieldsSelector = [];
    selectedFields.forEach((field) => fieldsSelector.push(`fields.${field}`));
    fieldsSelector = fieldsSelector.join(",");

    const entries = await environmentObject.getEntries({
      content_type: selectedContentType,
      select: fieldsSelector,
      locale: sourceLocale,
      [query]: selectedFilterValuesString,
    });

    // keep only the fields and the sys info
    const localizableEntries = entries.items
      .map((item) => {
        const id = item.sys.id;
        const fields = item.fields;
        if (fields) {
          fields.entryId = id;
          return fields;
        }
        return null;
      })
      .filter((entry) => entry !== null);

    console.log(localizableEntries);

    this.setState({
      sourceText: JSON.stringify(localizableEntries),
      openSourceTextModal: true,
    });
  };

  handleCloseSourceTextModal = () => {
    this.setState({ openSourceTextModal: false, sourceText: "" });
  };

  // IMPORT

  getLocales = (environment) => {
    environment
      .getLocales()
      .then((response) => {
        const dropdownCategories = response.items.map((locale) => ({
          key: locale.sys.id,
          text: locale.name,
          value: locale.code,
        }));
        this.setState({ locales: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  setTargetLocale = (e, { value }) => {
    this.setState({ targetLocale: value });
  };

  setTranslation = (e) => {
    this.setState({ translation: e.target.value });
  };

  safelyParseJSON(json) {
    let parsed;

    try {
      parsed = JSON.parse(json);
    } catch (e) {
      console.log("error!!");
    }

    return parsed; // Returns undefined if json content is invalid and cannot be parsed
  }

  importContent = (parsedTranslation) => {
    const { environmentObject, targetLocale } = this.state;

    let updatedIds = [];
    let failedIds = [];

    parsedTranslation.forEach((entryItem) => {
      let keys = Object.keys(entryItem);
      // Remove the id from the content to be imported
      keys = keys.splice(0, keys.length - 1);

      environmentObject
        .getEntry(entryItem.entryId)
        .then((entry) => {
          keys.forEach((key) => {
            // If the translation is different to the source text
            if (
              entry.fields[key][targetLocale] !== entryItem[key][targetLocale]
            ) {
              // Update the source text
              entry.fields[key][targetLocale] = entryItem[key][targetLocale];
            }
          });
          entry
            .update()
            .then(() => {
              console.log(`Entry ${entryItem.entryId} updated.`);
              updatedIds.push(entryItem.entryId);
              console.log(updatedIds);
              const importLog = `Entries updated: ${updatedIds.join(
                ", "
              )}. Entries failed: ${failedIds.join(", ")}`;
              this.setState({ importLog, openImportLogModal: true });
            })
            .catch((e) => {
              console.log(e);
              failedIds.push(entryItem.entryId);
              console.log(failedIds);
              const importLog = `Entries updated: ${updatedIds.join(
                ", "
              )}. Entries failed: ${failedIds.join(", ")}`;
              this.setState({ importLog, openImportLogModal: true });
            });
        })
        .catch((e) => {
          console.log(e);
          failedIds.push(entryItem.entryId);
          console.log(failedIds);
          const importLog = `Entries updated: ${updatedIds.join(
            ", "
          )}. Entries failed: ${failedIds.join(", ")}`;
          this.setState({ importLog, openImportLogModal: true });
        });
    });

    this.setState({ translation: "", targetLocale: "" });
  };

  submitForm = () => {
    const { translation } = this.state;
    const parsedTranslation = this.safelyParseJSON(translation);

    if (parsedTranslation) {
      this.importContent(parsedTranslation);
    } else {
      const importLog = "Invalid json file. Import failed.";
      this.setState({ importLog, openImportLogModal: true });
    }
  };

  handleCloseImportLogModal = () => {
    this.setState({ openImportLogModal: false, importLog: "" });
  };

  handleExportDefault = () => {
    // get all content types
    const { contentTypes, environmentObject } = this.state;
    let allContentForExport = [];
    // map them into an array of only the content type ids
    const contentTypesArray = contentTypes.map(
      (contentType) => contentType.value
    );
    // for each content type
    contentTypesArray.forEach(async (contentType) => {
      // get the localizable fields
      const response = await (
        await environmentObject.getContentType(contentType)
      ).fields;
      const localizable = response.filter((field) => field.localized === true);
      console.log(localizable);

      // if the content type has any localizable fields
      if (localizable.length > 0) {
        // combine the ids of the localizable fields into the query needed for export
        const localizableFields = localizable.map((field) => field.id);

        let fieldsForExport = [];
        localizableFields.forEach((field) =>
          fieldsForExport.push(`fields.${field}`)
        );
        fieldsForExport = fieldsForExport.join(",");

        // export all entries for the content type, but only the localizable fields
        const entries = await environmentObject.getEntries({
          content_type: contentType,
          select: fieldsForExport,
        });

        // keep only the fields and the sys info
        const localizableEntries = entries.items
          .map((item) => {
            const id = item.sys.id;
            const fields = item.fields;
            if (fields) {
              fields.entryId = id;
              return fields;
            }
            return null;
          })
          .filter((entry) => entry !== null);

        console.log(localizableEntries);
        allContentForExport.push(localizableEntries);
        console.log(allContentForExport.flat());
        this.setState({
          sourceText: JSON.stringify(allContentForExport.flat()),
          openSourceTextModal: true,
        });
      }
    });
  };

  exportDefault = () => {
    const {
      openSourceTextModal,
      sourceText,
      selectedEnvironment,
      contentTypes,
    } = this.state;

    return (
      <ExportDefault
        openSourceTextModal={openSourceTextModal}
        sourceText={sourceText}
        selectedEnvironment={selectedEnvironment}
        contentTypes={contentTypes}
        // functions
        handleExportDefault={this.handleExportDefault}
        handleCloseSourceTextModal={this.handleCloseSourceTextModal}
      />
    );
  };

  export = () => {
    const {
      openSourceTextModal,
      sourceText,
      contentTypes,
      selectedContentType,
      fields,
      selectedFields,
      filters,
      selectedFilter,
      filterValues,
      selectedFilterValues,
      selectedEnvironment,
      locales,
      sourceLocale,
    } = this.state;

    return (
      <Export
        openSourceTextModal={openSourceTextModal}
        sourceText={sourceText}
        contentTypes={contentTypes}
        selectedContentType={selectedContentType}
        fields={fields}
        selectedFields={selectedFields}
        filters={filters}
        selectedFilter={selectedFilter}
        filterValues={filterValues}
        selectedFilterValues={selectedFilterValues}
        selectedEnvironment={selectedEnvironment}
        locales={locales}
        sourceLocale={sourceLocale}
        setSourceLocale={this.setSourceLocale}
        setContentType={this.setContentType}
        setFields={this.setFields}
        setFilter={this.setFilter}
        setFilterValues={this.setFilterValues}
        handleExport={this.handleExport}
        handleCloseSourceTextModal={this.handleCloseSourceTextModal}
      />
    );
  };

  import = () => {
    const {
      translation,
      locales,
      targetLocale,
      openImportLogModal,
      importLog,
      selectedEnvironment,
    } = this.state;

    return (
      <Import
        translation={translation}
        locales={locales}
        targetLocale={targetLocale}
        openImportLogModal={openImportLogModal}
        importLog={importLog}
        selectedEnvironment={selectedEnvironment}
        // functions
        setTargetLocale={this.setTargetLocale}
        submitForm={this.submitForm}
        handleCloseImportLogModal={this.handleCloseImportLogModal}
        setTranslation={this.setTranslation}
      />
    );
  };

  render() {
    return (
      <div>
        {this.displayAuthDetails()}
        {this.exportDefault()}
        {this.export()}
        {this.import()}
      </div>
    );
  }
}

export default Integration;
