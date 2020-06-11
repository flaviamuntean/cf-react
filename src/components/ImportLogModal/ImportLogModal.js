import React, { Component } from "react";
import { Modal, Header } from "semantic-ui-react";

class ImportLogModal extends Component {
  render() {
    const { open, content, handleCloseModal } = this.props;
    return (
      <Modal open={open} closeIcon onClose={handleCloseModal}>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>Import Log</Header>
            <p>{content}</p>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}

export default ImportLogModal;
