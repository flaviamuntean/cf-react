import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Header,
  Dropdown,
  Button,
  Segment,
  Grid,
} from "semantic-ui-react";

class EntryTagger extends Component {
  static propTypes = {
    entryIdsForTagging: PropTypes.string.isRequired,
    // tags
    tags: PropTypes.array.isRequired,
    setTagsForTagging: PropTypes.func.isRequired,
    selectedTagsForTagging: PropTypes.array.isRequired,
    // functions
    setEntryIdsForTagging: PropTypes.func.isRequired,
    handleApplyingTagsToEntries: PropTypes.func.isRequired,
    handleRemovingTagsFromEntries: PropTypes.func.isRequired,
  };

  tagger = () => {
    const {
      entryIdsForTagging,
      setEntryIdsForTagging,
      // tags
      tags,
      setTagsForTagging,
      selectedTagsForTagging,
      // functions
      handleApplyingTagsToEntries,
      handleRemovingTagsFromEntries,
    } = this.props;

    return (
      <Segment color="grey">
        <Header as="h2">Tag Entries</Header>
        <Form>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <p style={{ marginTop: "20px" }}>
                  1. Paste here the entry IDs separated by a comma
                </p>
                <Form.TextArea
                  placeholder="wSJQPj3qsJCT9AxTz6UfF,2zZe12WwH862N5lyQAaPzc"
                  value={entryIdsForTagging}
                  onChange={(e) => setEntryIdsForTagging(e)}
                />
              </Grid.Column>
              <Grid.Column>
                <p style={{ marginTop: "20px" }}>
                  2. Choose the tag(s) to apply/remove
                </p>
                <Dropdown
                  placeholder="Metadata tags"
                  multiple
                  selection
                  clearable
                  fluid
                  search
                  options={tags}
                  onChange={setTagsForTagging}
                  value={selectedTagsForTagging}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <br />
          <Button.Group style={{ width: "100%" }}>
            <Button color="green" onClick={handleApplyingTagsToEntries}>
              Apply tags
            </Button>
            <Button.Or />
            <Button color="orange" onClick={handleRemovingTagsFromEntries}>
              Remove tags
            </Button>
          </Button.Group>
        </Form>
      </Segment>
    );
  };

  render() {
    return this.tagger();
  }
}

export default EntryTagger;
