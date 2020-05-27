import React, { Component } from "react";
import { Container, Grid } from "semantic-ui-react";
import "./App.css";
import Integration from "./Integration";
// import Cli from "./Cli";

class App extends Component {
  render() {
    return (
      <Container style={{ marginTop: "60px", marginBottom: "60px" }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              {/* <Cli />
              <Divider style={{ marginTop: "50px" }} /> */}
              <Integration />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default App;
