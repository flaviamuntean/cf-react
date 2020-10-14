import React, { Component } from "react";
import {
  Header,
  Grid,
  Button,
  Dropdown,
  Loader,
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
    };
  }

  static propTypes = {
    environmentObject: PropTypes.object,
    contentTypes: PropTypes.array.isRequired,
    tags: PropTypes.array.isRequired,
    locales: PropTypes.array.isRequired,
    addToIntegrationState: PropTypes.func.isRequired,
  };

  handleMetaExport = async () => {
    const { selectedMetaTags } = this.state;
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
        const localizableFields = localizable.map((field) => field.id);

        const fieldsForExport = localizableFields.map(
          (field) => `fields.${field}`
        );

        // export all entries for the content type, but only the localizable fields + filters
        environmentObject
          .getEntries({
            content_type: contentType,
            select: fieldsForExport,
            limit: 1000,
            "metadata.tags.sys.id[all]": tagsForExport,
          })
          .then((entries) => {
            // keep only the fields and the sys info
            let numberExportedEntries = 0;

            const localizableEntries = entries.items
              .map((item) => {
                const id = item.sys.id;
                if (item.fields) {
                  const fields = Helpers.filterByLang(
                    item.fields,
                    this.state.sourceLocale
                  );

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
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
    Promise.all(promises).then(() =>
      this.setState({ sourceTextModalLoading: false })
    );
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
    });
  };

  filters = () => {
    const { contentTypes, tags, locales } = this.props;

    const { selectedMetaTags, sourceLocale } = this.state;

    if (tags.length > 0) {
      return (
        <Grid.Row columns={2}>
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
            <p style={{ marginTop: "20px" }}>2. Filter by one or more tags</p>
            <Dropdown
              placeholder="Metadata tags (entry must include all selected tags)"
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
        </Grid.Row>
      );
    } else if (contentTypes.length > 0 && tags.length === 0) {
      return (
        <Grid.Row columns={1}>
          <Grid.Column>
            <Loader active inline="centered">
              Loading Filters
            </Loader>
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
    const { selectedMetaTags, sourceLocale } = this.state;

    return (
      <Segment color="grey">
        <Header as="h2">Export Source Text</Header>
        <Grid>
          {this.filters()}
          <Grid.Row columns={1}>
            <Grid.Column>
              <Button
                color="teal"
                fluid
                disabled={
                  !sourceLocale ||
                  !environmentObject ||
                  contentTypes.length === 0 ||
                  selectedMetaTags.length === 0
                }
                onClick={this.handleMetaExport}
              >
                Export
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
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
