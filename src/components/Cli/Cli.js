import React, { Component } from "react";
import {
  Grid,
  Dropdown,
  Icon,
  Input,
  Header,
  Divider,
  Message,
  Checkbox,
} from "semantic-ui-react";
import { createClient } from "contentful";

class Cli extends Component {
  constructor() {
    super();
    this.state = {
      space: "",
      products: [],
      dropdownProducts: [],
      dropdownContentTypes: [],
      dropdownFields: [],
      dropdownFieldValues: [],
      contentType: "",
      field: "",
      fieldValues: [],
      importFileName: "",
      chosenExportOptions: [],
      skipPublishOnImport: "",
      chosenOperator: "",
    };
    this.client = createClient({
      accessToken: "2lV8Lr_5HyJ_XHectmn9RFEt8iGpKP9gSpdyExllxgo",
      space: "mhyerafzzaiq",
    });

    this.managementClient = createClient({
      accessToken: "CFPAT-DLuFdJmbxdQ8yfleF9mpy6sALkqehYEfrgvFO4MZRrQ",
      space: "mhyerafzzaiq",
    });
  }

  componentDidMount() {
    this.getContentTypes();
  }

  getContentTypes = async () => {
    const response = await this.client.getContentTypes();

    const dropdownCategories = response.items.map((contentType) => ({
      key: contentType.sys.id,
      text: contentType.sys.id,
      value: contentType.sys.id,
    }));
    this.setState({ dropdownContentTypes: dropdownCategories });
  };

  getFields = async (contentType) => {
    const response = await (await this.client.getContentType(contentType))
      .fields;
    const dropdownCategories = response.map((field) => ({
      key: field.id,
      text: field.name,
      value: field.id,
    }));
    this.setState({ dropdownFields: dropdownCategories });
  };

  getFieldValues = async (chosenContentType, chosenField) => {
    console.log(chosenField);
    const entries = await this.client.getEntries({
      content_type: chosenContentType,
    });

    console.log(JSON.stringify(entries.items));

    const fieldValues = entries.items.map((entry) => entry.fields[chosenField]);

    const uniqueFieldValues = fieldValues
      .flat()
      .filter((v, i) => fieldValues.flat().indexOf(v) === i);

    const dropdownCategories = uniqueFieldValues.map((value) => ({
      key: value,
      text: value,
      value: value,
    }));
    this.setState({ dropdownFieldValues: dropdownCategories });
  };

  setImportFileName = (e) => {
    this.setState({ importFileName: e.target.value });
  };

  setContentType = (e, { value }) => {
    this.setState({ contentType: value });
    if (value) {
      this.getFields(value);
    } else {
      this.setState({ dropdownFields: [] });
    }
  };

  setField = (e, { value }) => {
    const { contentType } = this.state;
    this.setState({ field: value });
    if (value) {
      this.getFieldValues(contentType, value);
    }
  };

  setFieldValues = (e, { value }) => {
    if (value) {
      this.setState({ fieldValues: value });
    } else {
      this.setState({ fieldValues: [] });
    }
  };

  exportOptions = () => {
    return [
      {
        key: "drafts",
        text: "Include drafts in the exported entries",
        value: "--include-drafts",
      },
      {
        key: "archived",
        text: "Include archived entries in the exported entries",
        value: "--include-archived",
      },
      {
        key: "content-only",
        text: "Only export entries and assets",
        value: "--content-only",
      },
      {
        key: "download-assets",
        text: "Download assets",
        value: "--download-assets",
      },
    ];
  };

  operatorOptions = () => {
    return [
      {
        key: "equals",
        text: "equals",
        value: "=",
      },
      {
        key: "not-equals",
        text: "does not equal",
        value: "[ne]=",
      },
      {
        key: "includes-any",
        text: "includes any chosen value",
        value: "[in]=",
      },
      {
        key: "includes-all",
        text: "includes all chosen values",
        value: "[all]=",
      },
      {
        key: "excludes",
        text: "excludes all chosen values",
        value: "[nin]=",
      },
    ];
  };

  setExportOptions = (e, { value }) => {
    const options = value.join(" ");
    this.setState({ chosenExportOptions: options });
  };

  setOperator = (e, { value }) => {
    this.setState({ chosenOperator: value });
  };

  importValidation = () => {
    const { importFileName } = this.state;

    if (importFileName && !importFileName.includes(" ")) {
      return <Icon name="check" style={{ color: "#05B8A9" }} />;
    }
    return null;
  };

  importError = () => {
    const { importFileName } = this.state;

    if (!importFileName) {
      return (
        <Message negative size="small">
          <Message.Content>
            <Icon name="exclamation" />
            Please type in the file name.
          </Message.Content>
        </Message>
      );
    } else if (importFileName.includes(" ")) {
      return (
        <Message negative size="small">
          <Message.Content>
            <Icon name="exclamation" />
            Please avoid using spaces in the file name.
          </Message.Content>
        </Message>
      );
    }
    return null;
  };

  handleContentPublishing = (e, data) => {
    if (data.checked) {
      this.setState({ skipPublishOnImport: "--skip-content-publishing" });
    } else {
      this.setState({ skipPublishOnImport: "" });
    }
  };

  contentTypePresent = () => {
    const { contentType } = this.state;
    if (contentType) {
      return `--query-entries 'content_type=${contentType}`;
    }
    return "";
  };

  fieldPresent = () => {
    const { contentType, field } = this.state;
    if (contentType && field) {
      return `&fields.${field}`;
    }
    return "";
  };

  render() {
    const {
      dropdownContentTypes,
      contentType,
      dropdownFields,
      dropdownFieldValues,
      importFileName,
      chosenExportOptions,
      skipPublishOnImport,
      chosenOperator,
      fieldValues,
      field,
    } = this.state;
    return (
      <div>
        {" "}
        <Header as="h2">Export command for Contentful (CLI)</Header>
        <div>
          <p>
            1. Choose your export options. By default all information contained
            in the Contentful space will be exported, which may not be what you
            need.
          </p>
          <Dropdown
            placeholder="Select export options"
            multiple
            selection
            fluid
            options={this.exportOptions()}
            onChange={this.setExportOptions}
          />
          <br />
          <p>
            2. Select the content type you want to export from the Contentful
            space. You can only specify one value at a time. If you need several
            content types, you will need to export them separately.
          </p>
          <Dropdown
            placeholder="Select the content type"
            selection
            clearable
            options={dropdownContentTypes}
            onChange={this.setContentType}
          />
          <br />
          <br />
          <p>
            3. Filter by fields. As fields differ based on content type, you can
            only select a field once you've selected the relevant content type.
          </p>
          <Grid columns={3}>
            <Grid.Row>
              <Grid.Column>
                <Dropdown
                  placeholder="Field"
                  selection
                  clearable
                  fluid
                  disabled={!contentType}
                  options={dropdownFields}
                  onChange={this.setField}
                />
              </Grid.Column>
              <Grid.Column>
                <Dropdown
                  placeholder="Operator"
                  selection
                  clearable
                  fluid
                  disabled={!field}
                  options={this.operatorOptions()}
                  onChange={this.setOperator}
                />
              </Grid.Column>
              <Grid.Column>
                <Dropdown
                  placeholder="Value"
                  selection
                  multiple
                  fluid
                  disabled={!field || !chosenOperator}
                  options={dropdownFieldValues}
                  onChange={this.setFieldValues}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
        <p style={{ marginTop: "14px" }}>
          Copy this command and paste it in your terminal:
        </p>
        <strong>{`contentful space export ${chosenExportOptions} ${this.contentTypePresent()}${this.fieldPresent()}${chosenOperator}${fieldValues}${
          contentType ? "'" : ""
        }`}</strong>
        <Divider />
        <Header as="h2">Import command for Contentful (CLI)</Header>
        <p>Enter the name of the file you are importing</p>
        <Input
          placeholder="File name"
          onChange={this.setImportFileName}
          required={true}
        />
        <br />
        <Checkbox
          style={{ marginTop: "14px" }}
          label="Skips content publishing. Creates content but does not publish it."
          onClick={this.handleContentPublishing}
        />
        <p style={{ marginTop: "14px" }}>
          Copy this command and paste it in your terminal:
        </p>
        {this.importValidation()}
        <strong>{`contentful space import ${skipPublishOnImport} --content-file ${importFileName}.json`}</strong>
        {this.importError()}
      </div>
    );
  }
}

export default Cli;
