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

class ExportMeta extends Component {
  static propTypes = {
    // states from Integration
    selectedEnvironment: PropTypes.string.isRequired,
    contentTypes: PropTypes.array.isRequired,
    // functions from Integration
    handleExportDefault: PropTypes.func.isRequired,
    // filters
    tags: PropTypes.array.isRequired,
    setTags: PropTypes.func.isRequired,
    selectedTags: PropTypes.array.isRequired,
  };

  filters = () => {
    const {
      contentTypes,
      tags,
      setTags,
      selectedTags,
      sourceLocale,
      locales,
      setSourceLocale,
    } = this.props;

    if (tags.length > 0) {
      return (
        <Grid.Row columns={2}>
          <Grid.Column>
            <p style={{ marginTop: "20px" }}>1. Choose your source language</p>
            <Dropdown
              placeholder="Source language"
              selection
              clearable
              fluid
              value={sourceLocale}
              options={locales}
              onChange={setSourceLocale}
            />
          </Grid.Column>
          <Grid.Column>
            <p style={{ marginTop: "20px" }}>2. Filter by one or more tags</p>
            <Dropdown
              placeholder="Metadata tags (entry must include all selected tags)"
              multiple
              selection
              clearable
              fluid
              search
              options={tags}
              onChange={setTags}
              value={selectedTags}
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
    const {
      selectedEnvironment,
      contentTypes,
      sourceLocale,
      // functions
      handleExportDefault,
      // filters,
      selectedTags,
    } = this.props;

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
                  !selectedEnvironment ||
                  contentTypes.length === 0 ||
                  !selectedTags
                }
                onClick={handleExportDefault}
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
    return this.export();
  }
}

export default ExportMeta;
