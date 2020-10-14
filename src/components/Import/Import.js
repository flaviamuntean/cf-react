import React, { Component } from "react";
import isEqual from "lodash/isEqual";
import PropTypes from "prop-types";
import {
  Form,
  Header,
  Dropdown,
  Button,
  Segment,
  Icon,
  Grid,
} from "semantic-ui-react";
import Files from "react-files";
import ImportLogModal from "../ImportLogModal/ImportLogModal";
import Helpers from "../../utils/Helpers";
import "./Import.css";

class UploadedFile extends Component {
  render() {
    return (
      <div className="file-box-row">
        <div>
          <Icon name="file text outline" /> {this.props.name}
        </div>

        <Icon
          name="delete"
          style={{ marginLeft: "25px", cursor: "pointer" }}
          onClick={this.props.removeFile}
        />
      </div>
    );
  }
}

class Import extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translation: "",
      targetLocale: "",
      metaTagsToApply: [],
      metaTagsToRemove: [],
      uploadedFiles: [],
      uploadedJsonContent: {},
      importLog: "",
      openImportLogModal: false,
      errorLog: "",
    };

    this.fileReader = new FileReader();
    this.fileReader.onload = (event) => {
      try {
        this.setState({ uploadedJsonContent: JSON.parse(event.target.result) });
      } catch (error) {
        const importLog = "Invalid json file. Upload failed.";
        this.setState({
          importLog,
          openImportLogModal: true,
          uploadedFiles: [],
          uploadedJsonContent: {},
        });
      }
    };
  }

  static propTypes = {
    locales: PropTypes.array.isRequired,
    environmentObject: PropTypes.object,
    tags: PropTypes.array.isRequired,
  };

  handleFormFieldChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  onFilesError = (error, file) => {
    console.log("error code " + error.code + ": " + error.message);
  };

  filesRemoveOne = (file) => {
    this.refs.files.removeFile(file);
  };

  showFiles() {
    const { uploadedFiles } = this.state;

    if (uploadedFiles.length > 0) {
      return uploadedFiles.map((file) => (
        <UploadedFile
          key={file.id}
          name={file.name}
          file={file}
          removeFile={this.filesRemoveOne.bind(this, file)}
        />
      ));
    }
  }

  uploadTargetFiles = (files) => {
    // Read the last uploaded file. To be changed to a method that allows iterrating over multiple files.
    if (files.length) {
      this.setState({ uploadedFiles: files });
      this.fileReader.readAsText(files[files.length - 1]);
    } else {
      this.setState({ uploadedFiles: [], uploadedJsonContent: {} });
    }
  };

  importContent = (parsedTranslation) => {
    const { environmentObject } = this.props;
    const { targetLocale } = this.state;

    let updatedIds = [];
    let failedIds = [];
    let ignoredIds = [];

    parsedTranslation.forEach((entryItem) => {
      let keys = Object.keys(entryItem);
      // Remove the id from the content to be imported
      keys = keys.splice(0, keys.length - 1);

      environmentObject
        .getEntry(entryItem.entryId)
        .then((entry) => {
          let needsUpdating = false;
          keys.forEach((key) => {
            if (
              // If the imported field has content for the chosen target language
              entryItem[key][targetLocale] !== undefined &&
              // And the translation is different to the source text
              !isEqual(
                entry.fields[key][targetLocale],
                entryItem[key][targetLocale]
              )
            ) {
              // Update the source text
              needsUpdating = true;
              entry.fields[key][targetLocale] = entryItem[key][targetLocale];
              this.updateMetaTagsOnImport(entry);
            }
          });

          if (needsUpdating) {
            entry
              .update()
              .then(() => {
                updatedIds.push(entryItem.entryId);
                this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
              })
              .catch((e) => {
                this.setErrorOnImport(
                  e,
                  entryItem,
                  failedIds,
                  updatedIds,
                  ignoredIds
                );
              });
          } else {
            ignoredIds.push(entryItem.entryId);
            this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
          }
        })
        .catch((e) => {
          this.setErrorOnImport(
            e,
            entryItem,
            failedIds,
            updatedIds,
            ignoredIds
          );
        });
    });

    this.setState({
      translation: "",
      targetLocale: "",
      uploadedJsonContent: {},
      uploadedFiles: [],
    });
  };

  setErrorOnImport = (e, entryItem, failedIds, updatedIds, ignoredIds) => {
    console.log(e);
    this.setState((st) => ({
      errorLog:
        st.errorLog +
        `${e}\n\n=========================================================================================\n\n`,
    }));
    failedIds.push(entryItem.entryId);
    this.writeAndShowImportLog(updatedIds, failedIds, ignoredIds);
  };

  updateMetaTagsOnImport = (entry) => {
    const { metaTagsToApply, metaTagsToRemove } = this.state;

    const tagsToApply = metaTagsToApply.map((t) => this.tagIdToObject(t));

    metaTagsToRemove.forEach((tag) => {
      this.removeTag(entry, tag);
    });

    tagsToApply.forEach((tag) => {
      if (!this.tagExists(entry, tag.sys.id)) {
        entry.metadata.tags.push(tag);
      }
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

  removeTag = (entry, tagName) => {
    if (this.tagExists(entry, tagName)) {
      const i = entry.metadata.tags.findIndex((obj) => obj.sys.id === tagName);
      entry.metadata.tags.splice(i, 1);
    }
  };

  submitForm = () => {
    const { translation, uploadedJsonContent } = this.state;
    const parsedTranslation = Helpers.safelyParseJSON(translation);

    if (
      !!uploadedJsonContent &&
      Object.keys(uploadedJsonContent).length !== 0
    ) {
      this.importContent(uploadedJsonContent);
    } else if (parsedTranslation) {
      this.importContent(parsedTranslation);
    } else {
      const importLog = "Invalid json file. Import failed.";
      this.setState({ importLog, openImportLogModal: true });
    }
  };

  writeAndShowImportLog = (updatedIds, failedIds, ignoredIds) => {
    const importLog = `Entries updated (${
      updatedIds.length
    }): ${updatedIds.join(", ")}\n\nEntries failed (${
      failedIds.length
    }): ${failedIds.join(
      ", "
    )}\n\nEntries ignored - translation missing or does not differ from source text (${
      ignoredIds.length
    }): ${ignoredIds.join(", ")}`;

    this.setState({ importLog, openImportLogModal: true });
  };

  handleCloseImportLogModal = () => {
    this.setState({
      openImportLogModal: false,
      importLog: "",
      errorLog: "",
      metaTagsToApply: [],
      metaTagsToRemove: [],
    });
  };

  import = () => {
    const { locales, tags, environmentObject } = this.props;

    const {
      translation,
      targetLocale,
      metaTagsToApply,
      metaTagsToRemove,
      uploadedFiles,
      importLog,
      errorLog,
      openImportLogModal,
    } = this.state;

    return (
      <Segment color="grey">
        <Header as="h2">Import Translation</Header>
        <Form>
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <p style={{ marginTop: "20px" }}>
                  1. Choose your target language
                </p>
                <Dropdown
                  placeholder="Target language"
                  name="targetLocale"
                  fluid
                  selection
                  clearable
                  value={targetLocale}
                  options={locales}
                  onChange={this.handleFormFieldChange}
                />
              </Grid.Column>
            </Grid.Row>
            <p style={{ marginTop: "20px", marginBottom: "0" }}>
              2. Choose the tag(s) to apply/remove on the entries on import
            </p>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Dropdown
                  placeholder="Metadata tags to apply"
                  name="metaTagsToApply"
                  multiple
                  selection
                  clearable
                  fluid
                  search
                  options={tags}
                  onChange={this.handleFormFieldChange}
                  value={metaTagsToApply}
                />
              </Grid.Column>
              <Grid.Column>
                <Dropdown
                  placeholder="Metadata tags to remove"
                  name="metaTagsToRemove"
                  multiple
                  selection
                  clearable
                  fluid
                  search
                  options={tags}
                  onChange={this.handleFormFieldChange}
                  value={metaTagsToRemove}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>

          <br />
          <p style={{ marginTop: "20px" }}>
            3. Add the translations by choosing one of the two options below
          </p>

          <Form.TextArea
            placeholder="Paste here the translated .json content..."
            name="translation"
            value={translation}
            onChange={this.handleFormFieldChange}
            disabled={uploadedFiles.length > 0}
          />

          <div className="files">
            <Files
              ref="files"
              className="files-dropzone"
              onError={this.onFilesError}
              onChange={this.uploadTargetFiles}
              accepts={[".json"]}
              clickable
              multiple={false}
            >
              Alternatively drag & drop your .json file here or{" "}
              <span style={{ textDecoration: "underline", color: "#0366d6" }}>
                click to choose your file
              </span>
            </Files>
          </div>
          <br />
          <div
            style={{
              border: "1px solid #e1e4e8",
              borderRadius: "6px",
            }}
          >
            {this.showFiles()}
          </div>

          <br />

          <Button
            color="yellow"
            disabled={
              (!translation && uploadedFiles.length === 0) ||
              !targetLocale ||
              !environmentObject
            }
            fluid
            onClick={this.submitForm}
          >
            Import
          </Button>
        </Form>
        <ImportLogModal
          open={openImportLogModal}
          content={importLog}
          errorLog={errorLog}
          handleCloseModal={this.handleCloseImportLogModal}
        />
      </Segment>
    );
  };

  render() {
    return this.import();
  }
}

export default Import;
