import React, { Component } from "react";
import {
  Container,
  Grid,
  Modal,
  Button,
  Header,
  Form,
} from "semantic-ui-react";
import "./App.css";
import Integration from "../Integration/Integration";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";

// import Cli from "./Cli";

class App extends Component {
  constructor() {
    super();
    this.state = {
      spaceID: "",
      accessToken: "",
      submittedAccessToken: "testtoken",
      submittedSpaceID: "",
      open: true,
    };
  }

  componentWillMount() {
    const cookieData = CookieUtils.readUserStateFromCookies();
    const { spaceID, accessToken } = cookieData;

    this.setState({ spaceID, accessToken });

    if (cookieData.spaceID && cookieData.accessToken) {
      this.setState({
        open: false,
        submittedAccessToken: accessToken,
        submittedSpaceID: spaceID,
      });
    }
  }

  handleTokenChange = (e, { name, value }) =>
    this.setState({ [name]: value }, () => {
      const key = `access_token`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });

  handleSpaceChange = (e, { name, value }) =>
    this.setState({ [name]: value }, () => {
      const key = `space_id`;
      // 5 days from the current time
      const expires = new Date(Date.now() + 86400 * 1000 * 5).toUTCString();
      WindowUtils.setCookie(key, value, expires);
    });

  handleSubmit = () => {
    const { spaceID, accessToken } = this.state;

    this.setState({
      submittedSpaceID: spaceID,
      submittedAccessToken: accessToken,
      open: false,
    });
  };

  openAuthModal = () => {
    this.setState({ open: true });
  };

  render() {
    const {
      open,
      spaceID,
      accessToken,
      submittedAccessToken,
      submittedSpaceID,
    } = this.state;

    return (
      <Container style={{ marginTop: "60px", marginBottom: "60px" }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              {/* <Cli />
              <Divider style={{ marginTop: "50px" }} /> */}
              <Integration
                spaceID={submittedSpaceID}
                accessToken={submittedAccessToken}
                openAuthModal={this.openAuthModal}
              />
              <Modal open={open}>
                <Modal.Content>
                  <Modal.Description>
                    <Header>Contentful Authentication</Header>
                    <Form>
                      <Form.Input
                        placeholder="Space ID"
                        label="Space ID"
                        name="spaceID"
                        value={spaceID}
                        onChange={this.handleSpaceChange}
                      />
                      <Form.Input
                        placeholder="CDM Access Token"
                        label="CDM Access Token"
                        name="accessToken"
                        value={accessToken}
                        onChange={this.handleTokenChange}
                      />
                    </Form>
                  </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                  <Button
                    primary
                    onClick={this.handleSubmit}
                    disabled={!accessToken || !spaceID}
                  >
                    Submit
                  </Button>
                </Modal.Actions>
              </Modal>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default App;
