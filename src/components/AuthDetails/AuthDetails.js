import React, { Component } from "react";
import { Dropdown, Button, Grid, Segment } from "semantic-ui-react";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";

class AuthDetails extends Component {
  constructor() {
    super();
    this.state = {
      environment: "",
      submittedSpace: "",
      submittedEnvironment: "",
    };
  }

  componentDidMount() {
    const cookieData = CookieUtils.readUserStateFromCookies();
    const { environment } = cookieData;

    this.setState({ environment });
  }

  handleEnvironmentChange = (e, { name, value }) =>
    this.setState({ [name]: value }, () => {
      const key = `environment`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });

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
