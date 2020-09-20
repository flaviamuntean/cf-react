import React, { Component } from "react";
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
  static propTypes = {
    translation: PropTypes.string.isRequired,
    locales: PropTypes.array.isRequired,
    targetLocale: PropTypes.string.isRequired,
    openImportLogModal: PropTypes.bool.isRequired,
    importLog: PropTypes.string.isRequired,
    errorLog: PropTypes.string.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
    uploadedFiles: PropTypes.array.isRequired,
    // tags
    tags: PropTypes.array.isRequired,
    setImportTags: PropTypes.func.isRequired,
    selectedImportTags: PropTypes.array.isRequired,
    // functions
    setTargetLocale: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
    handleCloseImportLogModal: PropTypes.func.isRequired,
    setTranslation: PropTypes.func.isRequired,
    handleUploadTargetFiles: PropTypes.func.isRequired,
  };

  onFilesError = (error, file) => {
    console.log("error code " + error.code + ": " + error.message);
  };

  filesRemoveOne = (file) => {
    this.refs.files.removeFile(file);
  };

  showFiles() {
    const { uploadedFiles } = this.props;

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

  import = () => {
    const {
      // states from Integration
      translation,
      locales,
      targetLocale,
      openImportLogModal,
      importLog,
      errorLog,
      selectedEnvironment,
      uploadedFiles,
      // tags
      tags,
      setImportTags,
      selectedImportTags,
      // functions from Integration
      setTargetLocale,
      submitForm,
      handleCloseImportLogModal,
      setTranslation,
      handleUploadTargetFiles,
    } = this.props;

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
                  fluid
                  selection
                  clearable
                  value={targetLocale}
                  options={locales}
                  onChange={setTargetLocale}
                />
              </Grid.Column>
              <Grid.Column>
                <p style={{ marginTop: "20px" }}>
                  2. Choose the tag(s) to apply on the entries on import
                </p>
                <Dropdown
                  placeholder="Metadata tags"
                  multiple
                  selection
                  clearable
                  fluid
                  search
                  options={tags}
                  onChange={setImportTags}
                  value={selectedImportTags}
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
            value={translation}
            onChange={(e) => setTranslation(e)}
            disabled={uploadedFiles.length > 0}
          />

          <div className="files">
            <Files
              ref="files"
              className="files-dropzone"
              onError={this.onFilesError}
              onChange={handleUploadTargetFiles}
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
            color="teal"
            disabled={
              (!translation && uploadedFiles.length === 0) ||
              !targetLocale ||
              !selectedEnvironment
            }
            fluid
            onClick={submitForm}
          >
            Import
          </Button>
        </Form>
        <ImportLogModal
          open={openImportLogModal}
          content={importLog}
          errorLog={errorLog}
          handleCloseModal={handleCloseImportLogModal}
        />
      </Segment>
    );
  };

  render() {
    return this.import();
  }
}

export default Import;
