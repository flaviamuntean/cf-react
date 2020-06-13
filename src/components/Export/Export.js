import React, { Component } from "react";
import { Header, Dropdown, Grid, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

class Export extends Component {
  static propTypes = {
    // states from Integration
    contentTypes: PropTypes.array.isRequired,
    selectedContentType: PropTypes.string.isRequired,
    fields: PropTypes.array.isRequired,
    selectedFields: PropTypes.array.isRequired,
    filters: PropTypes.array.isRequired,
    selectedFilter: PropTypes.string.isRequired,
    filterValues: PropTypes.array.isRequired,
    selectedFilterValues: PropTypes.array.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
    locales: PropTypes.array.isRequired,
    sourceLocale: PropTypes.string.isRequired,
    // functions from Integration
    setSourceLocale: PropTypes.func.isRequired,
    setContentType: PropTypes.func.isRequired,
    setFields: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    setFilterValues: PropTypes.func.isRequired,
    handleExport: PropTypes.func.isRequired,
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
      // functions
      setSourceLocale,
      setContentType,
      setFields,
      setFilter,
      setFilterValues,
      handleExport,
    } = this.props;
    return (
      <div>
        <Header as="h2" style={{ marginTop: "45px" }}>
          Export
        </Header>
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
                onChange={setSourceLocale}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Select the content type"
                selection
                clearable
                fluid
                options={contentTypes}
                onChange={setContentType}
                value={selectedContentType}
                disabled={!selectedEnvironment || !sourceLocale}
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
                onChange={setFields}
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
                onChange={setFilter}
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
                onChange={setFilterValues}
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
                onClick={handleExport}
              >
                Export
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  };

  render() {
    return this.export();
  }
}

export default Export;
