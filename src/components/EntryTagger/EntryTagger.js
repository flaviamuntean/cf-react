import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Form,
  Header,
  Dropdown,
  Button,
  Segment,
  Grid,
  Modal,
  Icon,
} from "semantic-ui-react";

class EntryTagger extends Component {
  constructor(props) {
    super(props);
    this.state = {
      entryIdsForTagging: "",
      selectedTagsForTagging: [],
      confirmationModalOpen: false,
      confirmationModalText: "",
    };
  }

  static propTypes = {
    tags: PropTypes.array.isRequired,
    environmentObject: PropTypes.object,
  };

  handleFormFieldChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  handleApplyingTagsToEntries = () => {
    const { entryIdsForTagging, selectedTagsForTagging } = this.state;
    const { environmentObject } = this.props;
    const ids = entryIdsForTagging.split(",");

    ids.forEach((id) => {
      environmentObject.getEntry(id).then((entry) => {
        const tagsToApply = selectedTagsForTagging.map((t) =>
          this.tagIdToObject(t)
        );

        tagsToApply.forEach((tag) => {
          if (!this.tagExists(entry, tag.sys.id)) {
            entry.metadata.tags.push(tag);
          }
        });

        entry
          .update()
          .then(() =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Tags updated.`,
              entryIdsForTagging: [],
              selectedTagsForTagging: [],
            })
          )
          .catch((error) =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Error: ${error}.`,
            })
          );
      });
    });
  };

  handleRemovingTagsFromEntries = () => {
    const { entryIdsForTagging, selectedTagsForTagging } = this.state;
    const { environmentObject } = this.props;
    const ids = entryIdsForTagging.split(",");

    ids.forEach((id) => {
      environmentObject.getEntry(id).then((entry) => {
        selectedTagsForTagging.forEach((tag) => {
          if (this.tagExists(entry, tag)) {
            // remove the ready tag
            const i = entry.metadata.tags.findIndex(
              (obj) => obj.sys.id === tag
            );
            entry.metadata.tags.splice(i, 1);
          }
        });

        entry
          .update()
          .then(() =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Tags updated.`,
              entryIdsForTagging: [],
              selectedTagsForTagging: [],
            })
          )
          .catch((error) =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Error: ${error}.`,
            })
          );
      });
    });
  };

  tagExists = (entry, tagName) =>
    entry.metadata.tags.some((el) => el.sys.id === tagName);

  tagIdToObject = (t) => ({
    sys: {
      type: "Link",
      linkType: "Tag",
      id: t,
    },
  });

  confirmationModal = () => {
    const { confirmationModalOpen, confirmationModalText } = this.state;
    return (
      <Modal
        basic
        open={confirmationModalOpen}
        size="small"
        onClose={() => this.setState({ confirmationModalOpen: false })}
      >
        <Header icon>
          <Icon
            name={
              confirmationModalText.includes("Error")
                ? "exclamation"
                : "checkmark"
            }
          />
          {confirmationModalText.includes("Error") ? "Error" : "Success"}
        </Header>
        <Modal.Content style={{ textAlign: "center" }}>
          {confirmationModalText}
        </Modal.Content>
      </Modal>
    );
  };

  tagger = () => {
    const { tags, environmentObject } = this.props;

    const { entryIdsForTagging, selectedTagsForTagging } = this.state;

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
                  name="entryIdsForTagging"
                  value={entryIdsForTagging}
                  onChange={this.handleFormFieldChange}
                />
              </Grid.Column>
              <Grid.Column>
                <p style={{ marginTop: "20px" }}>
                  2. Choose the tag(s) to apply/remove
                </p>
                <Dropdown
                  placeholder="Metadata tags"
                  name="selectedTagsForTagging"
                  multiple
                  selection
                  clearable
                  fluid
                  search
                  options={tags}
                  onChange={this.handleFormFieldChange}
                  value={selectedTagsForTagging}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <br />
          <Button.Group style={{ width: "100%" }}>
            <Button
              color="green"
              onClick={this.handleApplyingTagsToEntries}
              disabled={!environmentObject}
            >
              Apply tags
            </Button>
            <Button.Or />
            <Button
              color="orange"
              onClick={this.handleRemovingTagsFromEntries}
              disabled={!environmentObject}
            >
              Remove tags
            </Button>
          </Button.Group>
        </Form>
      </Segment>
    );
  };

  render() {
    return (
      <div>
        {this.tagger()}
        {this.confirmationModal()}
      </div>
    );
  }
}

export default EntryTagger;
