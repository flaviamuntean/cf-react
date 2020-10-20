import React, { Component } from "react";
import {
  Form,
  Header,
  Grid,
  Button,
  Dropdown,
  Message,
  Segment,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import Helpers from "../../utils/Helpers";
import SourceTextModal from "../SourceTextModal/SourceTextModal";

class ExportMeta extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMetaTags: [],
      sourceLocale: "",
      openSourceTextModal: false,
      sourceTextModalLoading: false,
      sourceText: "",
      numberSourceEntries: 0,
      sourceIds: [],
      fieldsToExclude: "",
    };
  }

  static propTypes = {
    environmentObject: PropTypes.object,
    contentTypes: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    locales: PropTypes.array.isRequired,
    addToIntegrationState: PropTypes.func.isRequired,
  };

  handleMetaExport = () => {
    const { selectedMetaTags, fieldsToExclude } = this.state;
    const { contentTypes, environmentObject } = this.props;

    this.setState({ openSourceTextModal: true, sourceTextModalLoading: true });

    const tagsForExport = Helpers.generateTagsSelector(selectedMetaTags);

    let allContentForExport = [];
    // map content types into an array of only the content type ids
    const contentTypesArray = contentTypes.map(
      (contentType) => contentType.value
    );

    // for each content type
    let promises = contentTypesArray.map(async (contentType) => {
      // get the localizable fields
      const response = await (
        await environmentObject.getContentType(contentType)
      ).fields;
      const localizable = Helpers.filterByLocalizable(response);

      // if the content type has any localizable fields
      if (localizable.length > 0) {
        // combine the ids of the localizable fields into the query needed for export
        const localizableFields = localizable
          .filter((field) => !fieldsToExclude.split(",").includes(field.id))
          .map((field) => field.id);

        if (localizableFields.length > 0) {
          const fieldsForExport = localizableFields.map(
            (field) => `fields.${field}`
          );

          // export all entries for the content type, but only the localizable fields
          this.exportFieldsPerContentType(
            environmentObject,
            contentType,
            fieldsForExport,
            tagsForExport,
            allContentForExport
          );
        }
      }
    });
    Promise.all(promises).then(() =>
      this.setState({ sourceTextModalLoading: false })
    );
  };

  exportFieldsPerContentType = async (
    environmentObject,
    contentType,
    fieldsForExport,
    tagsForExport,
    allContentForExport,
    allentries = [],
    skip = 0
  ) => {
    let results;
    if (tagsForExport) {
      results = await environmentObject.getEntries({
        content_type: contentType,
        select: fieldsForExport,
        limit: 1000,
        skip: skip,
        "metadata.tags.sys.id[all]": tagsForExport,
      });
    } else {
      results = await environmentObject.getEntries({
        content_type: contentType,
        select: fieldsForExport,
        limit: 1000,
        skip: skip,
      });
    }
    const entries = [...allentries, ...results.items];
    if (entries.length < results.total) {
      this.exportFieldsPerContentType(
        environmentObject,
        contentType,
        fieldsForExport,
        tagsForExport,
        allContentForExport,
        entries,
        skip + 1000
      );
    } else {
      this.preProcessEntries(entries, allContentForExport);
    }
  };

  preProcessEntries = (entries, allContentForExport) => {
    // keep only the fields and the sys info
    let numberExportedEntries = 0;

    const localizableEntries = entries
      .map((item) => {
        const id = item.sys.id;
        if (item.fields) {
          let fields;
          if (this.state.sourceLocale) {
            fields = Helpers.filterByLang(item.fields, this.state.sourceLocale);
          } else {
            fields = item.fields;
          }

          if (
            Object.keys(fields).length === 0 &&
            fields.constructor === Object
          ) {
            return null;
          } else {
            fields.entryId = id;
            numberExportedEntries++;
            return fields;
          }
        }
        return null;
      })
      .filter((entry) => entry !== null);

    allContentForExport.push(localizableEntries);

    this.setState((prevState, props) => ({
      sourceText: JSON.stringify(allContentForExport.flat(), null, 2),
      sourceIds: allContentForExport.flat().map((e) => e.entryId),
      numberSourceEntries:
        prevState.numberSourceEntries + numberExportedEntries,
    }));
  };

  handleFormFieldChange = (e, { name, value }) => {
    this.setState({ [name]: value });

    if (name === "selectedMetaTags") {
      this.props.addToIntegrationState(name, value);
    }
  };

  handleCloseSourceTextModal = () => {
    this.setState({
      openSourceTextModal: false,
      sourceText: "",
      numberSourceEntries: 0,
      sourceLocale: "",
      selectedMetaTags: [],
      sourceIds: [],
      fieldsToExclude: "",
    });
  };

  filters = () => {
    const { contentTypes, tags, locales } = this.props;

    const { selectedMetaTags, sourceLocale, fieldsToExclude } = this.state;

    if (contentTypes.length > 0) {
      return (
        <Grid.Row columns={3}>
          <Grid.Column>
            <p style={{ marginTop: "20px" }}>1. Choose your source language</p>
            <Dropdown
              placeholder="Source language"
              name="sourceLocale"
              selection
              clearable
              fluid
              value={sourceLocale}
              options={locales}
              onChange={this.handleFormFieldChange}
            />
          </Grid.Column>
          <Grid.Column>
            <p style={{ marginTop: "20px" }}>
              2. Filter by one or more metadata tags
            </p>
            <Dropdown
              placeholder="Entry must include all selected tags"
              name="selectedMetaTags"
              multiple
              selection
              clearable
              fluid
              search
              options={tags}
              onChange={this.handleFormFieldChange}
              value={selectedMetaTags}
            />
          </Grid.Column>
          <Grid.Column>
            <p style={{ marginTop: "20px" }}>
              3. Enter fields to exclude (separated by a comma)
            </p>
            <Form.Input
              placeholder="slug,pageMetadata"
              name="fieldsToExclude"
              value={fieldsToExclude}
              onChange={this.handleFormFieldChange}
            />
          </Grid.Column>
        </Grid.Row>
      );
    }

    return (
      <Grid.Row columns={1}>
        <Grid.Column>
          <Message>No content available for this environment.</Message>
        </Grid.Column>
      </Grid.Row>
    );
  };

  export = () => {
    const { environmentObject, contentTypes } = this.props;

    return (
      <Segment color="grey">
        <Header as="h2">Export Source Text</Header>
        <Form>
          <Grid>
            {this.filters()}
            <Grid.Row columns={1}>
              <Grid.Column>
                <Button
                  color="teal"
                  fluid
                  disabled={!environmentObject || contentTypes.length === 0}
                  onClick={this.handleMetaExport}
                >
                  Export
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Form>
      </Segment>
    );
  };

  render() {
    const {
      openSourceTextModal,
      sourceTextModalLoading,
      sourceText,
      sourceIds,
      numberSourceEntries,
    } = this.state;
    return (
      <div>
        {this.export()}
        <SourceTextModal
          open={openSourceTextModal}
          loading={sourceTextModalLoading}
          sourceText={sourceText}
          sourceIds={sourceIds}
          numberSourceEntries={numberSourceEntries}
          handleCloseModal={this.handleCloseSourceTextModal}
        />
      </div>
    );
  }
}

export default ExportMeta;
