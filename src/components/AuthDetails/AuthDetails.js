import React, { Component } from "react";
import { Dropdown, Button, Grid, Segment } from "semantic-ui-react";

class AuthDetails extends Component {
  render() {
    const {
      changeToken,
      spaces,
      selectedSpace,
      environments,
      selectedEnvironment,
      handleSpaceSelection,
      handleEnvironmentSelection,
    } = this.props;

    return (
      <Segment color="red" secondary>
        <Grid columns={3}>
          <Grid.Row>
            <Grid.Column>
              <Button color="red" fluid onClick={changeToken}>
                Change Access Token
              </Button>
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Choose your space"
                selection
                fluid
                value={selectedSpace}
                options={spaces}
                onChange={handleSpaceSelection}
              />
            </Grid.Column>
            <Grid.Column>
              <Dropdown
                placeholder="Choose your environment"
                selection
                fluid
                name="environment"
                value={selectedEnvironment}
                options={environments}
                onChange={handleEnvironmentSelection}
                disabled={!selectedSpace}
              />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default AuthDetails;
