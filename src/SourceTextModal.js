import React, { Component } from "react";
import { Modal, Header, Icon, Button } from "semantic-ui-react";
import "./App.css";

class SourceTextModal extends Component {
  render() {
    const { open, sourceText, handleCloseModal } = this.props;
    return (
      <Modal open={open} closeIcon onClose={handleCloseModal}>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>Source text</Header>
            <p>{sourceText}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary>
            <Icon name="clipboard" /> Copy
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default SourceTextModal;
