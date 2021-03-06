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
      accessToken: "",
      submittedAccessToken: "",
      open: true,
    };
  }

  componentWillMount() {
    const cookieData = CookieUtils.readUserStateFromCookies();
    const { accessToken } = cookieData;

    this.setState({ accessToken });

    if (cookieData.accessToken) {
      this.setState({
        open: false,
        submittedAccessToken: accessToken,
      });
    }
  }

  handleTokenChange = (e, { value }) =>
    this.setState({ accessToken: value }, () => {
      WindowUtils.setCookie(`access_token`, value, 180);
    });

  handleSubmit = () => {
    const { accessToken } = this.state;

    this.setState({
      submittedAccessToken: accessToken,
      open: false,
    });
  };

  openAuthModal = () => {
    this.setState({ open: true });
  };

  render() {
    const { open, accessToken, submittedAccessToken } = this.state;

    return (
      <Container style={{ marginTop: "30px", marginBottom: "40px" }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              {/* <Cli />
              <Divider style={{ marginTop: "50px" }} /> */}
              <Integration
                accessToken={submittedAccessToken}
                openAuthModal={this.openAuthModal}
              />
              <Modal open={open}>
                <Modal.Content>
                  <Modal.Description>
                    <Header>Contentful Authentication</Header>
                    <Form>
                      <Form.Input
                        required
                        placeholder="CFPAT-DLu478d5fd7Vb8f3E874gDbfe3es8U3ef57"
                        label="CMA Access Token"
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
                    disabled={!accessToken}
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
