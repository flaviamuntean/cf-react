import React, { Component } from "react";
import { Header, Grid, Button } from "semantic-ui-react";
import PropTypes from "prop-types";

class ExportDefault extends Component {
  static propTypes = {
    // states from Integration
    selectedEnvironment: PropTypes.string.isRequired,
    contentTypes: PropTypes.array.isRequired,
    // functions from Integration
    handleExportDefault: PropTypes.func.isRequired,
  };

  export = () => {
    const {
      selectedEnvironment,
      contentTypes,
      // functions
      handleExportDefault,
    } = this.props;
    return (
      <div>
        <Header as="h2" style={{ marginTop: "45px" }}>
          Export all localizable fields
        </Header>
        <Grid>
          <Grid.Row columns={1}>
            <Grid.Column>
              <Button
                color="teal"
                fluid
                disabled={!selectedEnvironment || contentTypes.length === 0}
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
