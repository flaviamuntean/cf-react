import React, { Component } from "react";
import { Form, Header, Dropdown, Grid, Button } from "semantic-ui-react";
import SourceTextModal from "../SourceTextModal/SourceTextModal";
import AuthDetails from "../AuthDetails/AuthDetails";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";
// import Export from "../Export/Export";

import { createClient } from "contentful-management";

Object.filter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate));

class Integration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translation: "",
      sourceText: "",
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
      this.setState({ selectedEnvironment: "" });
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
          text: environment.name,
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
    this.setState({ selectedContentType: value });
    if (value) {
      this.getFields(value);
      this.getFilters(value);
    } else {
      this.setState({
        fields: [],
        filters: [],
        selectedFields: [],
        selectedFilter: "",
        selectedFilterValues: [],
      });
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
    this.setState({ selectedFilter: value });
    if (value) {
      this.getFilterValues(selectedContentType, value);
    } else {
      this.setState({ selectedFilterValues: [] });
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
    const localizableEntries = entries.items.map((item) => {
      const id = item.sys.id;
      const fields = item.fields;
      fields.entryId = id;
      return fields;
    });

    console.log(localizableEntries);

    this.setState({
      sourceText: JSON.stringify(localizableEntries),
      openSourceTextModal: true,
    });
  };

  handleCloseModal = () => {
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

  submitForm = () => {
    const { translation, environmentObject, targetLocale } = this.state;
    const parsedTranslation = JSON.parse(translation);

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
          entry.update();
        })
        .then(console.log(`Entry ${entryItem.entryId} updated.`))
        .catch((e) => {
          console.log(e);
        });
    });

    this.setState({ translation: "", targetLocale: "" });
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
      <div>
        {this.displayAuthDetails()}
        <Header as="h2">Export</Header>
        <Grid columns={3}>
          <p style={{ marginTop: "20px", marginBottom: "0" }}>
            1. Select export options
          </p>

          <Grid.Row>
            <Grid.Column>
              <Dropdown
                placeholder="Select the source language"
                selection
                clearable
                fluid
                value={sourceLocale}
                options={locales}
                onChange={this.setSourceLocale}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Select the content type"
                selection
                clearable
                fluid
                options={contentTypes}
                onChange={this.setContentType}
                value={selectedContentType}
                disabled={!selectedEnvironment}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Select the localizable fields you want to export"
                selection
                clearable
                multiple
                fluid
                disabled={!selectedContentType}
                options={fields}
                onChange={this.setFields}
                value={selectedFields}
              />
            </Grid.Column>
          </Grid.Row>
          <p style={{ marginTop: "10px", marginBottom: "0" }}>
            2. Include optional filters
          </p>
          <Grid.Row>
            <Grid.Column>
              <Dropdown
                placeholder="Filter by field..."
                selection
                clearable
                fluid
                disabled={!selectedContentType}
                options={filters}
                onChange={this.setFilter}
                value={selectedFilter}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="...with the value of"
                selection
                clearable
                fluid
                multiple
                search
                disabled={!selectedFilter}
                options={filterValues}
                onChange={this.setFilterValues}
                value={selectedFilterValues}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <Button
                color="teal"
                fluid
                disabled={
                  !selectedContentType ||
                  selectedFields.length === 0 ||
                  (!!selectedFilter && selectedFilterValues.length === 0)
                }
                onClick={this.handleExport}
              >
                Export
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <SourceTextModal
          open={openSourceTextModal}
          sourceText={sourceText}
          handleCloseModal={this.handleCloseModal}
        />
      </div>
    );
  };

  import = () => {
    const { translation, locales, targetLocale } = this.state;
    return (
      <div>
        <Header as="h2" style={{ marginTop: "45px" }}>
          Import
        </Header>
        <Form>
          <Dropdown
            placeholder="Select the target language"
            selection
            clearable
            value={targetLocale}
            options={locales}
            onChange={this.setTargetLocale}
          />
          <br />
          <br />
          <Form.TextArea
            placeholder="Paste here the translated json content..."
            value={translation}
            onChange={(e) => this.setTranslation(e)}
          />
          <Button
            color="teal"
            disabled={!translation || !targetLocale}
            fluid
            onClick={this.submitForm}
          >
            Import
          </Button>
        </Form>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.export()}
        {this.import()}
      </div>
    );
  }
}

export default Integration;
