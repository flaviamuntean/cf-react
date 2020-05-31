import React, { Component } from "react";
import { Header, Dropdown, Grid, Button } from "semantic-ui-react";
import SourceTextModal from "../SourceTextModal/SourceTextModal";
// import Export from "../Export/Export";

Object.filter = (obj, predicate) =>
  Object.fromEntries(Object.entries(obj).filter(predicate));

class Export extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceText: "",
      entriesForExport: [],
      // basic states

      selectedContentType: "",
      fields: [],
      selectedFields: [],
      // filters
      filters: [],
      selectedFilter: "",
      filterValues: [],
      selectedFilterValues: [],
      // modals
      openSourceTextModal: false,
      //
    };
    this.arr = [];
  }

  // EXPORT OPTIONS

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

  setFilters = (e, { value }) => {
    const { selectedContentType } = this.state;
    this.setState({ selectedFilter: value });
    if (value) {
      this.getFilterValues(selectedContentType, value);
    } else {
      this.setState({ selectedFilterValues: [] });
    }
  };

  getFilterValues = async (chosenContentType, chosenField) => {
    const { environmentObject } = this.state;
    const entries = await environmentObject.getEntries({
      content_type: chosenContentType,
    });

    const fieldValues = entries.items.map(
      (entry) => entry.fields[chosenField] || null
    );
    const fieldValuesArray = fieldValues.map((entry) => {
      if (entry) {
        return entry["en-US"];
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
    } = this.state;
    const selectedFilterValuesString = selectedFilterValues.join(",");
    let query;

    if (selectedFilterValues.length > 1) {
      query = `fields.${selectedFilter}[in]`;
    } else {
      query = `fields.${selectedFilter}`;
    }

    const entries = await environmentObject.getEntries({
      content_type: selectedContentType,
      [query]: selectedFilterValuesString,
    });
    const entryIDs = entries.items.map((item) => item.sys.id);
    this.getEntries(entryIDs);
    this.setState({ openSourceTextModal: true });
  };

  getEntries = (entryIDs) => {
    entryIDs.map((id) => this.getIndividualEntry(id));
  };

  getIndividualEntry = async (id) => {
    const { environmentObject, selectedFields } = this.state;
    const entry = await environmentObject.getEntry(id);
    const localizableEntry = Object.filter(entry.fields, ([key, value]) =>
      selectedFields.includes(key)
    );
    localizableEntry.entryId = id;
    this.arr.push(localizableEntry);
    this.setState({ entriesForExport: this.arr });
    this.setState({
      sourceText: JSON.stringify(this.state.entriesForExport),
    });
  };

  handleCloseModal = () => {
    this.setState({ openSourceTextModal: false, sourceText: "" });
    this.arr = [];
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
                options={contentTypes}
                onChange={this.setContentType}
                value={selectedContentType}
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
                onChange={this.setFilters}
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

  render() {
    return this.export();
  }
}

export default Export;
