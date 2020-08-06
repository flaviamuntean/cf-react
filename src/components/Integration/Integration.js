import React, { Component } from "react";
import isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import AuthDetails from "../AuthDetails/AuthDetails";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";
import Helpers from "../../utils/Helpers";
import Export from "../Export/Export";
import ExportDefault from "../ExportDefault/ExportDefault";
import Import from "../Import/Import";
import SourceTextModal from "../SourceTextModal/SourceTextModal";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import { createClient } from "contentful-management";

import "./Integration.css";

class Integration extends Component {
  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    openAuthModal: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
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
      openSourceTextModal: false,
      openImportLogModal: false,
      translation: "",
      sourceText: "",
      importLog: "",
      errorLog: "",
      numberSourceEntries: 0,
      // export default
      allFieldsForFiltering: [],
      selectedAllFieldsFilter: "",
      allFieldsValues: "",
      // import upload
      uploadedJsonContent: {},
      uploadedFiles: [],
      // errors
      showErrorMsg: false,
      errorMsgContent: "",
    };

    this.fileReader = new FileReader();
    this.fileReader.onload = (event) => {
      try {
        this.setState({ uploadedJsonContent: JSON.parse(event.target.result) });
      } catch (error) {
        const importLog = "Invalid json file. Upload failed.";
        this.setState({
          importLog,
          openImportLogModal: true,
          uploadedFiles: [],
          uploadedJsonContent: {},
        });
      }
    };
  }

  componentDidMount() {
    this.getInitialIntegrationDetails();
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.accessToken !== this.props.accessToken) {
      window.scrollTo(0, 0);
      this.setInitState();
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
      allFieldsForFiltering: [],
      selectedAllFieldsFilter: "",
      allFieldsValues: "",
      showErrorMsg: false,
      errorMsgContent: "",
    });
  };

  getInitialIntegrationDetails = () => {
    if (this.props.accessToken) {
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
          .then((environment) => {
            this.setState({ environmentObject: environment });
            this.getContentTypesAndLocales(environment);
          });
      }
    }
  };

  getContentTypesAndLocales = (environmentObject) => {
    this.getContentTypes(environmentObject);
    this.getLocales(environmentObject);
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
        const dropdownCategories = Helpers.generateSpacesDropdown(spaces);
        this.setState({ spaces: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
        // Remove all information on spaces and environments if the spaces are not fetched (most likely due to the token being invalid)
        this.setInitState();
        this.setState({
          showErrorMsg: true,
          errorMsgContent:
            "The access token you entered could not be found or is invalid. Please ensure you have the correct token and try again.",
        });
      });
  };

  // Select a space
  handleSpaceSelection = (e, { value }) => {
    this.setState({ selectedSpace: value }, () => {
      WindowUtils.setCookie(`space`, value, 180);
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
      allFieldsForFiltering: [],
      selectedAllFieldsFilter: "",
      allFieldsValues: "",
    });
    if (value) {
      this.managementClient
        .getSpace(value)
        .then((space) => this.setState({ spaceObject: space }));
      // Clear the environment cookie
      WindowUtils.setCookie(`environment`, "", 180);
      this.getEnvironments(value);
    }
  };

  // Get environments for the space
  getEnvironments = (space) => {
    this.managementClient
      .getSpace(space)
      .then((space) => space.getEnvironments())
      .then((environments) => {
        const dropdownCategories = Helpers.generateEnvironmentsDropdown(
          environments
        );
        this.setState({ environments: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Select an environment
  handleEnvironmentSelection = (e, { value }) => {
    this.setState({ selectedEnvironment: value }, () => {
      WindowUtils.setCookie(`environment`, value, 180);
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
      allFieldsForFiltering: [],
      selectedAllFieldsFilter: "",
      allFieldsValues: "",
    });
    if (value) {
      const { spaceObject } = this.state;
      spaceObject.getEnvironment(value).then((environment) => {
        this.setState({ environmentObject: environment });
        this.getContentTypesAndLocales(environment);
      });
    }
  };

  // EXPORT OPTIONS

  getContentTypes = (environment) => {
    environment
      .getContentTypes()
      .then((contentTypes) => {
        const dropdownCategories = Helpers.generateContentTypesDropdown(
          contentTypes
        );
        this.setState(
          { contentTypes: dropdownCategories },
          this.getAllFieldsForAllContentTypes
        );
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
    const selectedFields = Helpers.filterByLocalizable(response);
    const dropdownCategories = Helpers.generateFieldsDropdown(selectedFields);
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
    const dropdownCategories = Helpers.generateFiltersDropdown(response);
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
      limit: 1000,
    });

    const uniqueFieldValues = Helpers.getUniqueFieldValues(
      entries,
      chosenField,
      sourceLocale
    );

    const dropdownCategories = Helpers.generateFilterValuesDropdown(
      uniqueFieldValues
    );
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
    const query = Helpers.generateExportOptionsApiQuery(
      selectedFilterValues,
      selectedFilter
    );
    const fieldsSelector = Helpers.generateFieldsSelector(selectedFields);

    environmentObject
      .getEntries({
        content_type: selectedContentType,
        select: fieldsSelector,
        locale: sourceLocale,
        [query]: selectedFilterValuesString,
        limit: 1000,
      })
      .then((entries) => {
        let numberExportedEntries = 0;

        // keep only the fields and the sys info
        const localizableEntries = entries.items
          .map((item) => {
            const id = item.sys.id;
            if (item.fields) {
              const fields = Helpers.filterByLang(
                item.fields,
                this.state.sourceLocale
              );

              if (
                Object.keys(fields).length === 0 &&
                fields.constructor === Object
              ) {
                return null;
              } else {
                fields.entryId = id;
                numberExportedEntries++;
                return fields;
              }
            }
            return null;
          })
          .filter((entry) => entry !== null);

        this.setState((prevState, props) => ({
          sourceText: JSON.stringify(localizableEntries, null, 2),
          openSourceTextModal: true,
          numberSourceEntries:
            prevState.numberSourceEntries + numberExportedEntries,
        }));
      });
  };

  handleCloseSourceTextModal = () => {
    this.setState({
      openSourceTextModal: false,
      sourceText: "",
      numberSourceEntries: 0,
    });
  };

  // IMPORT

  getLocales = (environment) => {
    environment
      .getLocales()
      .then((locales) => {
        const dropdownCategories = Helpers.generateLocalesDropdown(locales);
        this.setState({ locales: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  setTargetLocale = (e, { value }) => {
    this.setState({ targetLocale: value });
  };

  uploadTargetFiles = (files) => {
    // Read the last uploaded file. To be changed to a method that allows iterrating over multiple files.
    if (files.length) {
      this.setState({ uploadedFiles: files });
      this.fileReader.readAsText(files[files.length - 1]);
    } else {
      this.setState({ uploadedFiles: [], uploadedJsonContent: {} });
    }
  };

  setTranslation = (e) => {
    this.setState({ translation: e.target.value });
  };

  writeAndShowImportLog = (updatedIds, failedIds, ignoredIds) => {
    const importLog = `Entries updated (${
      updatedIds.length
    }): ${updatedIds.join(", ")}\n\nEntries failed (${
      failedIds.length
    }): ${failedIds.join(
      ", "
    )}\n\nEntries ignored - translation missing or does not differ from source text (${
      ignoredIds.length
    }): ${ignoredIds.join(", ")}`;

    this.setState({ importLog, openImportLogModal: true });
  };

  importContent = (parsedTranslation) => {
    const { environmentObject, targetLocale } = this.state;

    let updatedIds = [];
    let failedIds = [];
    let ignoredIds = [];

    parsedTranslation.forEach((entryItem) => {
      let keys = Object.keys(entryItem);
      // Remove the id from the content to be imported
      keys = keys.splice(0, keys.length - 1);

      environmentObject
        .getEntry(entryItem.entryId)
        .then((entry) => {
          let needsUpdating = false;
          keys.forEach((key) => {
            if (
              // If the imported field has content for the chosen target language
              entryItem[key][targetLocale] !== undefined &&
              // And the translation is different to the source text
              !isEqual(
                entry.fields[key][targetLocale],
                entryItem[key][targetLocale]
              )
            ) {
              // Update the source text
              needsUpdating = true;
              entry.fields[key][targetLocale] = entryItem[key][targetLocale];
            }
          });

          if (needsUpdating) {
            entry
              .update()
              .then(() => {
                updatedIds.push(entryItem.entryId);
                this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
              })
              .catch((e) => {
                console.log(e);
                this.setState((st) => ({
                  errorLog:
                    st.errorLog +
                    `${e}\n\n=========================================================================================\n\n`,
                }));
                failedIds.push(entryItem.entryId);
                this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
              });
          } else {
            ignoredIds.push(entryItem.entryId);
            this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
          }
        })
        .catch((e) => {
          console.log(e);
          this.setState((st) => ({
            errorLog:
              st.errorLog +
              `${e}\n\n=========================================================================================\n\n`,
          }));
          failedIds.push(entryItem.entryId);
          this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
        });
    });

    this.setState({
      translation: "",
      targetLocale: "",
      uploadedJsonContent: {},
      uploadedFiles: [],
    });
  };

  submitForm = () => {
    const { translation, uploadedJsonContent } = this.state;
    const parsedTranslation = Helpers.safelyParseJSON(translation);

    if (
      !!uploadedJsonContent &&
      Object.keys(uploadedJsonContent).length !== 0
    ) {
      this.importContent(uploadedJsonContent);
    } else if (parsedTranslation) {
      this.importContent(parsedTranslation);
    } else {
      const importLog = "Invalid json file. Import failed.";
      this.setState({ importLog, openImportLogModal: true });
    }
  };

  handleCloseImportLogModal = () => {
    this.setState({ openImportLogModal: false, importLog: "", errorLog: "" });
  };

  handleExportDefault = () => {
    const {
      contentTypes,
      environmentObject,
      allFieldsValues,
      selectedAllFieldsFilter,
    } = this.state;

    let allContentForExport = [];
    // map content types into an array of only the content type ids
    const contentTypesArray = contentTypes.map(
      (contentType) => contentType.value
    );
    // for each content type
    contentTypesArray.forEach(async (contentType) => {
      // get the localizable fields
      const response = await (
        await environmentObject.getContentType(contentType)
      ).fields;
      const localizable = Helpers.filterByLocalizable(response);

      // if the content type has any localizable fields
      if (localizable.length > 0) {
        // combine the ids of the localizable fields into the query needed for export
        const localizableFields = localizable.map((field) => field.id);

        const fieldsForExport = localizableFields.map(
          (field) => `fields.${field}`
        );

        const query = Helpers.generateExportDefaultApiQuery(
          allFieldsValues,
          selectedAllFieldsFilter
        );

        // export all entries for the content type, but only the localizable fields + filters
        environmentObject
          .getEntries({
            content_type: contentType,
            select: fieldsForExport,
            [query]: allFieldsValues,
            limit: 1000,
          })
          .then((entries) => {
            // keep only the fields and the sys info
            let numberExportedEntries = 0;

            const localizableEntries = entries.items
              .map((item) => {
                const id = item.sys.id;
                if (item.fields) {
                  const fields = Helpers.filterByLang(
                    item.fields,
                    this.state.sourceLocale
                  );

                  if (
                    Object.keys(fields).length === 0 &&
                    fields.constructor === Object
                  ) {
                    return null;
                  } else {
                    fields.entryId = id;
                    numberExportedEntries++;
                    return fields;
                  }
                }
                return null;
              })
              .filter((entry) => entry !== null);

            allContentForExport.push(localizableEntries);

            this.setState((prevState, props) => ({
              sourceText: JSON.stringify(allContentForExport.flat(), null, 2),
              openSourceTextModal: true,
              numberSourceEntries:
                prevState.numberSourceEntries + numberExportedEntries,
            }));
          })
          .catch((error) => console.log(error));
      }
    });
  };

  getAllFieldsForAllContentTypes = () => {
    // get all content types
    const { contentTypes, environmentObject } = this.state;
    // map them into an array of only the content type ids
    const contentTypesArray = contentTypes.map(
      (contentType) => contentType.value
    );
    // for each content type
    const allFields = contentTypesArray.map((contentType) =>
      // get the localizable fields
      environmentObject
        .getContentType(contentType)
        .then((cType) => cType.fields)
        .catch(console.error)
    );

    Promise.all(allFields).then((values) => {
      const response = values.flat();

      const fieldIDs = response.map((field) => field.id);
      const uniqueFilterIDs = fieldIDs.filter(
        (v, i) => fieldIDs.indexOf(v) === i
      );

      const dropdownCategories = Helpers.generateAllFieldsDropdown(
        uniqueFilterIDs
      );

      this.setState({ allFieldsForFiltering: dropdownCategories });
    });
  };

  setAllFieldsFilter = (e, { value }) => {
    // Set the value of the filter, but remove any values that were previously added for this filter
    this.setState({
      selectedAllFieldsFilter: value,
      allFieldsValues: "",
    });
  };

  setAllFieldsValues = (e, { value }) =>
    this.setState({ allFieldsValues: value });

  exportDefault = () => {
    const {
      selectedEnvironment,
      contentTypes,
      allFieldsForFiltering,
      selectedAllFieldsFilter,
      allFieldsValues,
      locales,
      sourceLocale,
    } = this.state;

    return (
      <ExportDefault
        selectedEnvironment={selectedEnvironment}
        contentTypes={contentTypes}
        locales={locales}
        sourceLocale={sourceLocale}
        setSourceLocale={this.setSourceLocale}
        // functions
        handleExportDefault={this.handleExportDefault}
        // new
        filters={allFieldsForFiltering}
        setFilter={this.setAllFieldsFilter}
        selectedFilter={selectedAllFieldsFilter}
        allFieldsValues={allFieldsValues}
        setAllFieldsValues={this.setAllFieldsValues}
      />
    );
  };

  export = () => {
    const {
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
      errorLog,
      selectedEnvironment,
      uploadedFiles,
    } = this.state;

    return (
      <Import
        translation={translation}
        locales={locales}
        targetLocale={targetLocale}
        openImportLogModal={openImportLogModal}
        importLog={importLog}
        errorLog={errorLog}
        selectedEnvironment={selectedEnvironment}
        uploadedFiles={uploadedFiles}
        // functions
        setTargetLocale={this.setTargetLocale}
        submitForm={this.submitForm}
        handleCloseImportLogModal={this.handleCloseImportLogModal}
        setTranslation={this.setTranslation}
        handleUploadTargetFiles={this.uploadTargetFiles}
      />
    );
  };

  render() {
    const {
      openSourceTextModal,
      sourceText,
      numberSourceEntries,
      showErrorMsg,
      errorMsgContent,
    } = this.state;

    return (
      <div>
        <ErrorMsg content={errorMsgContent} visible={showErrorMsg} />
        {this.displayAuthDetails()}
        {this.exportDefault()}
        {this.export()}
        <SourceTextModal
          open={openSourceTextModal}
          sourceText={sourceText}
          numberSourceEntries={numberSourceEntries}
          handleCloseModal={this.handleCloseSourceTextModal}
        />
        {this.import()}
      </div>
    );
  }
}

export default Integration;
