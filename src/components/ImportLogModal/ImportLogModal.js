import React, { Component } from "react";
import { Modal, Header, Button, Icon } from "semantic-ui-react";

class ImportLogModal extends Component {
  errorLogBtn = () => {
    const { errorLog } = this.props;

    if (errorLog) {
      const data =
        "data:text/plain;charset=utf-8," + encodeURIComponent(errorLog);
      return (
        <a
          href={data}
          download={`error_log_${new Date()
            .toLocaleString()
            .replace(", ", "_")
            .replace(/\//g, "-")
            .replace(/:/g, "")}.txt`}
          style={{ color: "white" }}
        >
          <Button primary>
            <Icon name="download" />
            Download Error Log
          </Button>
        </a>
      );
    }
  };

  render() {
    const { open, content, handleCloseModal } = this.props;

    return (
      <Modal open={open} closeIcon onClose={handleCloseModal}>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>Import Log</Header>
            <p style={{ whiteSpace: "break-spaces" }}>{content}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>{this.errorLogBtn()}</Modal.Actions>
      </Modal>
    );
  }
}

export default ImportLogModal;
