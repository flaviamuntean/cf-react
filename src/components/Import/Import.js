import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Header, Dropdown, Button, Segment } from "semantic-ui-react";
import ImportLogModal from "../ImportLogModal/ImportLogModal";

class Import extends Component {
  static propTypes = {
    translation: PropTypes.string.isRequired,
    locales: PropTypes.array.isRequired,
    targetLocale: PropTypes.string.isRequired,
    openImportLogModal: PropTypes.bool.isRequired,
    importLog: PropTypes.string.isRequired,
    errorLog: PropTypes.string.isRequired,
    selectedEnvironment: PropTypes.string.isRequired,
    // functions
    setTargetLocale: PropTypes.func.isRequired,
    submitForm: PropTypes.func.isRequired,
    handleCloseImportLogModal: PropTypes.func.isRequired,
    setTranslation: PropTypes.func.isRequired,
  };

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
      // functions from Integration
      setTargetLocale,
      submitForm,
      handleCloseImportLogModal,
      setTranslation,
    } = this.props;

    return (
      <Segment color="grey">
        <Header as="h2">Import Translation</Header>
        <Form>
          <Dropdown
            placeholder="Select the target language"
            selection
            clearable
            value={targetLocale}
            options={locales}
            onChange={setTargetLocale}
          />
          <br />
          <br />
          <Form.TextArea
            placeholder="Paste here the translated json content..."
            value={translation}
            onChange={(e) => setTranslation(e)}
          />
          <Button
            color="teal"
            disabled={!translation || !targetLocale || !selectedEnvironment}
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
