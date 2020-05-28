import React, { Component } from "react";
import { Dropdown, Button, Grid } from "semantic-ui-react";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";

class AuthDetails extends Component {
  constructor() {
    super();
    this.state = {
      space: "",
      environment: "",
      submittedSpace: "",
      submittedEnvironment: "",
    };
  }

  componentWillMount() {
    const cookieData = CookieUtils.readUserStateFromCookies();
    const { space, environment } = cookieData;

    this.setState({ space, environment });
  }

  handleSpaceChange = (e, { name, value }) =>
    this.setState({ [name]: value }, () => {
      const key = `space`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });

  handleEnvironmentChange = (e, { name, value }) =>
    this.setState({ [name]: value }, () => {
      const key = `environment`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });

  render() {
    const { space, environment } = this.state;
    const { dropdownSpaces, dropdownEnvironments, changeToken } = this.props;

    return (
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
              name="space"
              value={space}
              options={dropdownSpaces}
              onChange={this.handleSpaceChange}
            />
          </Grid.Column>
          <Grid.Column>
            <Dropdown
              placeholder="Choose your environment"
              selection
              fluid
              name="environment"
              value={environment}
              options={dropdownEnvironments}
              onChange={this.handleEnvironmentChange}
              disabled={!space}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default AuthDetails;
