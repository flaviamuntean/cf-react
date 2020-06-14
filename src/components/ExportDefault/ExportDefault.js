import React, { Component } from "react";
import {
  Header,
  Grid,
  Button,
  Dropdown,
  Input,
  Loader,
  Message,
  Segment,
} from "semantic-ui-react";
import PropTypes from "prop-types";

class ExportDefault extends Component {
  static propTypes = {
    // states from Integration
    selectedEnvironment: PropTypes.string.isRequired,
    contentTypes: PropTypes.array.isRequired,
    // functions from Integration
    handleExportDefault: PropTypes.func.isRequired,
    // filters
    filters: PropTypes.array.isRequired,
    setFilter: PropTypes.func.isRequired,
    selectedFilter: PropTypes.string.isRequired,
    allFieldsValues: PropTypes.string.isRequired,
    setAllFieldsValues: PropTypes.func.isRequired,
  };

  filters = () => {
    const {
      contentTypes,
      filters,
      setFilter,
      selectedFilter,
      allFieldsValues,
      setAllFieldsValues,
    } = this.props;

    if (filters.length > 0) {
      return (
        <Grid.Row columns={2}>
          <Grid.Column>
            <Dropdown
              placeholder="Filter by field..."
              selection
              clearable
              fluid
              search
              options={filters}
              onChange={setFilter}
              value={selectedFilter}
            />
          </Grid.Column>
          <Grid.Column>
            <Input
              fluid
              placeholder="...with the value of (separate multiple values using a comma)"
              disabled={!selectedFilter}
              value={allFieldsValues}
              onChange={setAllFieldsValues}
            />
          </Grid.Column>
        </Grid.Row>
      );
    } else if (contentTypes.length > 0 && filters.length === 0) {
      return (
        <Grid.Row columns={1}>
          <Grid.Column>
            <Loader active inline="centered">
              Loading Filters
            </Loader>
          </Grid.Column>
        </Grid.Row>
      );
    }

    return (
      <Grid.Row columns={1}>
        <Grid.Column>
          <Message>No content available for this environment.</Message>
        </Grid.Column>
      </Grid.Row>
    );
  };

  filterText = () => {
    const { filters } = this.props;

    if (filters.length > 0) {
      return (
        <p style={{ marginTop: "20px", marginBottom: "0" }}>
          Include optional filters
        </p>
      );
    }
  };

  export = () => {
    const {
      selectedEnvironment,
      contentTypes,
      // functions
      handleExportDefault,
      // filters,
      selectedFilter,
      allFieldsValues,
    } = this.props;

    return (
      <Segment color="grey">
        <Header as="h2">Export All Localizable Fields</Header>
        <Grid>
          {this.filterText()}
          {this.filters()}
          <Grid.Row columns={1}>
            <Grid.Column>
              <Button
                color="teal"
                fluid
                disabled={
                  !selectedEnvironment ||
                  contentTypes.length === 0 ||
                  (!!selectedFilter && allFieldsValues.length === 0)
                }
                onClick={handleExportDefault}
              >
                Export
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  };

  render() {
    return this.export();
  }
}

export default ExportDefault;
