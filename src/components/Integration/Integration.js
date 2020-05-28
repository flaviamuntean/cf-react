import React, { Component } from "react";
import { Form, Header, Dropdown, Grid, Button } from "semantic-ui-react";
import SourceTextModal from "../SourceTextModal/SourceTextModal";
import AuthDetails from "../AuthDetails/AuthDetails";
// import Export from "../Export/Export";

import { createClient } from "contentful-management";

Object.filter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate));

class Integration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      space: {},
      environment: {},
      translation: "",
      openSourceTextModal: false,
      sourceText: "",
      dropdownContentTypes: [],
      contentType: "",
      dropdownFields: [],
      localizableFields: [],
      entriesForExport: [],
      dropdownLocales: [],
      locale: "",
      dropdownFilterFields: [],
      filterField: "",
      dropdownFilterFieldsValues: [],
      filterFieldsValues: [],
      openAuthModal: true,
      dropdownSpaces: [],
    };
    this.arr = [];
    console.log(this.props.accessToken);
  }

  componentWillMount() {
    this.managementClient = createClient({
      accessToken: this.props.accessToken,
    });
    this.getSpaceDetails();
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevProps.spaceID !== this.props.spaceID ||
      prevProps.accessToken !== this.props.accessToken
    ) {
      this.managementClient = createClient({
        accessToken: this.props.accessToken,
      });
      this.getSpaceDetails();
    }
  };

  getSpaceDetails = () => {
    console.log(this.props.spaceID);
    this.managementClient
      .getSpace(this.props.spaceID)
      .then((space) => {
        this.setState({ space });
        this.getEnvironment();
        this.getContentTypes();
        this.getLocales();
        this.getSpaces();
      })
      .catch(console.log("error"));
  };

  getEnvironment = () => {
    const { space } = this.state;
    space
      .getEnvironment("master")
      .then((environment) => {
        this.setState({ environment });
      })
      .catch(console.log("Environment not found"));
  };

  getIndividualEntry = async (id) => {
    const { space, localizableFields } = this.state;
    const entry = await space.getEntry(id);
    const localizableEntry = Object.filter(entry.fields, ([key, value]) =>
      localizableFields.includes(key)
    );
    localizableEntry.entryId = id;
    this.arr.push(localizableEntry);
    this.setState({ entriesForExport: this.arr });
    this.setState({
      sourceText: JSON.stringify(this.state.entriesForExport),
    });
  };

  getEntries = (entryIDs) => {
    entryIDs.map((id) => this.getIndividualEntry(id));
  };

  submitForm = () => {
    const { translation, space, locale } = this.state;
    const parsedTranslation = JSON.parse(translation);

    parsedTranslation.forEach((entryItem) => {
      let keys = Object.keys(entryItem);
      // Remove the id from the content to be imported
      keys = keys.splice(0, keys.length - 1);

      space
        .getEntry(entryItem.entryId)
        .then((entry) => {
          console.log(keys);
          keys.forEach((key) => {
            // If the translation is different to the source text
            if (entry.fields[key][locale] !== entryItem[key][locale]) {
              // Update the source text
              entry.fields[key][locale] = entryItem[key][locale];
            }
          });
          entry.update();
        })
        .then(console.log(`Entry ${entryItem.entryId} updated.`))
        .catch(console.error);
    });

    this.setState({ translation: "" });
  };

  setTranslation = (e) => {
    this.setState({ translation: e.target.value });
  };

  handleCloseModal = () => {
    this.setState({ openSourceTextModal: false, sourceText: "" });
    this.arr = [];
  };

  getContentTypes = () => {
    const { space } = this.state;
    space
      .getContentTypes()
      .then((response) => {
        const dropdownCategories = response.items.map((contentType) => ({
          key: contentType.sys.id,
          text: contentType.name,
          value: contentType.sys.id,
        }));
        this.setState({ dropdownContentTypes: dropdownCategories });
      })
      .catch(console.log("Content types not found"));
  };

  setContentType = (e, { value }) => {
    this.setState({ contentType: value });
    if (value) {
      this.getFields(value);
      this.getFilterFields(value);
    } else {
      this.setState({
        dropdownFields: [],
        dropdownFilterFields: [],
        localizableFields: [],
        filterField: "",
      });
    }
  };

  getLocales = () => {
    const { space } = this.state;
    space
      .getLocales()
      .then((response) => {
        const dropdownCategories = response.items.map((locale) => ({
          key: locale.sys.id,
          text: locale.name,
          value: locale.code,
        }));
        this.setState({ dropdownLocales: dropdownCategories });
      })
      .catch(console.log("Locales not found"));
  };

  setLocale = (e, { value }) => {
    this.setState({ locale: value });
  };

  getFields = async (contentType) => {
    const { space } = this.state;

    const response = await (await space.getContentType(contentType)).fields;
    const localizableFields = response.filter(
      (field) => field.localized === true
    );
    const dropdownCategories = localizableFields.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
    this.setState({ dropdownFields: dropdownCategories });
  };

  setFields = (e, { value }) => {
    // const { contentType } = this.state;
    this.setState({ localizableFields: value });
    // if (value) {
    //   this.getFieldValues(contentType, value);
    // }
  };

  getFilterFields = async (contentType) => {
    const { space } = this.state;

    const response = await (await space.getContentType(contentType)).fields;
    const dropdownCategories = response.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
    this.setState({ dropdownFilterFields: dropdownCategories });
  };

  setFilterField = (e, { value }) => {
    const { contentType } = this.state;
    this.setState({ filterField: value });
    if (value) {
      this.getFilterFieldValues(contentType, value);
    } else {
      this.setState({ filterFieldsValues: [] });
    }
  };

  getFilterFieldValues = async (chosenContentType, chosenField) => {
    const { space } = this.state;
    console.log(chosenField);
    const entries = await space.getEntries({
      content_type: chosenContentType,
    });

    console.log(JSON.stringify(entries.items));

    const fieldValues = entries.items.map((entry) => entry.fields[chosenField]);
    const fieldValuesArray = fieldValues.map((entry) => entry["en-US"]);
    console.log(fieldValuesArray);

    const uniqueFieldValues = fieldValuesArray
      .flat()
      .filter((v, i) => fieldValuesArray.flat().indexOf(v) === i);

    const dropdownCategories = uniqueFieldValues.map((value) => ({
      key: value,
      text: value,
      value: value,
    }));
    this.setState({ dropdownFilterFieldsValues: dropdownCategories });
  };

  setFilterFieldValues = (e, { value }) => {
    if (value) {
      this.setState({ filterFieldsValues: value });
    } else {
      this.setState({ filterFieldsValues: [] });
    }
  };

  handleExport = async () => {
    const { space, contentType, filterFieldsValues, filterField } = this.state;
    const filterFieldsValuesString = filterFieldsValues.join(",");
    console.log(filterFieldsValuesString);
    let query;

    if (filterFieldsValues.length > 1) {
      query = `fields.${filterField}[in]`;
    } else {
      query = `fields.${filterField}`;
    }

    const entries = await space.getEntries({
      content_type: contentType,
      [query]: filterFieldsValuesString,
    });
    const entryIDs = entries.items.map((item) => item.sys.id);
    this.getEntries(entryIDs);
    this.setState({ openSourceTextModal: true });
  };

  displayAuthDetails = () => {
    const { openAuthModal } = this.props;
    const { dropdownSpaces } = this.state;

    return (
      <AuthDetails
        dropdownSpaces={dropdownSpaces}
        dropdownEnvironments={[]}
        changeToken={openAuthModal}
      />
    );
  };

  getSpaces = () => {
    this.managementClient
      .getSpaces()
      .then((spaces) => {
        const dropdownCategories = spaces.items.map((space) => ({
          key: space.sys.id,
          text: space.name,
          value: space.sys.id,
        }));
        this.setState({ dropdownSpaces: dropdownCategories });
      })
      .catch(console.log("error"));
  };

  getEnvironments = () => {
    this.managementClient
      .getSpaces()
      .then((spaces) => {
        const dropdownCategories = spaces.items.map((space) => ({
          key: space.sys.id,
          text: space.name,
          value: space.sys.id,
        }));
        this.setState({ dropdownSpaces: dropdownCategories });
      })
      .catch(console.log("error"));
  };

  export = () => {
    const {
      openSourceTextModal,
      sourceText,
      dropdownContentTypes,
      contentType,
      dropdownFields,
      localizableFields,
      dropdownFilterFields,
      filterField,
      dropdownFilterFieldsValues,
      filterFieldsValues,
    } = this.state;
    return (
      <div>
        {this.displayAuthDetails()}
        <Header as="h2">Export</Header>
        <Grid columns={2}>
          <p style={{ marginTop: "20px", marginBottom: "0" }}>
            1. Select export options
          </p>

          <Grid.Row>
            <Grid.Column>
              <Dropdown
                placeholder="Select the content type"
                selection
                clearable
                fluid
                options={dropdownContentTypes}
                onChange={this.setContentType}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Select the localizable fields you want to export"
                selection
                clearable
                multiple
                fluid
                disabled={!contentType}
                options={dropdownFields}
                onChange={this.setFields}
                value={localizableFields}
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
                disabled={!contentType}
                options={dropdownFilterFields}
                onChange={this.setFilterField}
                value={filterField}
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
                disabled={!filterField}
                options={dropdownFilterFieldsValues}
                onChange={this.setFilterFieldValues}
                value={filterFieldsValues}
              />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row columns={1}>
            <Grid.Column>
              <Button
                color="teal"
                fluid
                disabled={
                  !contentType ||
                  localizableFields.length === 0 ||
                  (filterField && filterFieldsValues.length === 0)
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
    const { translation, dropdownLocales, locale } = this.state;
    return (
      <div>
        <Header as="h2" style={{ marginTop: "45px" }}>
          Import
        </Header>
        <Form>
          <Dropdown
            placeholder="Select the language you want to import"
            selection
            clearable
            options={dropdownLocales}
            onChange={this.setLocale}
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
            disabled={!translation || !locale}
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
