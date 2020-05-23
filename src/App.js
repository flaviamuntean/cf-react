import React, { Component } from "react";
import {
  Container,
  Grid,
  Dropdown,
  Input,
  Header,
  Divider,
} from "semantic-ui-react";
import "./App.css";
import { createClient } from "contentful";

class App extends Component {
  constructor() {
    super();
    this.state = {
      products: [],
      dropdownProducts: [],
      dropdownContentTypes: [],
      contentType: "",
      importFileName: "",
    };
    this.client = createClient({
      accessToken: "2lV8Lr_5HyJ_XHectmn9RFEt8iGpKP9gSpdyExllxgo",
      space: "mhyerafzzaiq",
    });
  }

  componentDidMount() {
    // this.getProducts();
    this.getContentTypes();
  }

  getContentTypes = async () => {
    const response = await this.client.getContentTypes();
    console.log(response.items);

    const dropdownCategories = response.items.map((contentType) => ({
      key: contentType.sys.id,
      text: contentType.sys.id,
      value: contentType.sys.id,
    }));
    // console.log(dropdownCategories);
    this.setState({ dropdownContentTypes: dropdownCategories });
  };

  // getProducts = async () => {
  //   const response = await this.client.getEntries({ content_type: "product" });
  //   if (response.items) {
  //     this.setState({ products: response.items });
  //   }
  //   const dropdownCategories = this.state.products.map((product) => ({
  //     key: product.sys.id,
  //     text: product.fields.productName,
  //     value: product.fields.productName,
  //   }));
  //   this.setState({ dropdownProducts: dropdownCategories });
  // };

  setImportFileName = (e) => {
    this.setState({ importFileName: e.target.value });
  };

  setContentType = (e, { value }) => {
    this.setState({ contentType: value });
  };

  render() {
    const { dropdownContentTypes, importFileName, contentType } = this.state;
    return (
      <Container style={{ marginTop: "30px" }}>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Header as="h2">Export the file from Contentful</Header>
              <div>
                <Dropdown
                  placeholder="Select content type"
                  selection
                  options={dropdownContentTypes}
                  onChange={this.setContentType}
                />
              </div>
              <p style={{ marginTop: "14px" }}>
                Copy this command and paste it in your terminal:
              </p>
              <strong>{`contentful space export --content-only --query-entries 'content_type=${contentType}&fields.tags[match]=translation'`}</strong>

              <Divider />

              <Header as="h2">Import the file into Contentful</Header>
              <p>Enter the name of the file you are importing</p>
              <Input
                placeholder="File name"
                onChange={this.setImportFileName}
                required={true}
              />
              <p style={{ marginTop: "14px" }}>
                Copy this command and paste it in your terminal:
              </p>
              <strong>{`contentful space import --content-file ${importFileName}.json`}</strong>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default App;
