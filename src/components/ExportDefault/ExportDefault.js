import React, { Component } from "react";
import { Header, Grid, Button, Dropdown, Input } from "semantic-ui-react";
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

  export = () => {
    const {
      selectedEnvironment,
      contentTypes,
      // functions
      handleExportDefault,
      // filters
      filters,
      setFilter,
      selectedFilter,
      allFieldsValues,
      setAllFieldsValues,
    } = this.props;

    return (
      <div>
        <Header as="h2" style={{ marginTop: "45px" }}>
          Export all localizable fields
        </Header>
        <Grid>
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
                placeholder="...with the value of"
                disabled={!selectedFilter}
                value={allFieldsValues}
                onChange={setAllFieldsValues}
              />
            </Grid.Column>
          </Grid.Row>
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
      </div>
    );
  };

  render() {
    return this.export();
  }
}

export default ExportDefault;
