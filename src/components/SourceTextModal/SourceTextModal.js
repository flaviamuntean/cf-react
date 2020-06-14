import React, { Component } from "react";
import { Modal, Header, Icon, Button } from "semantic-ui-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

class SourceTextModal extends Component {
  handleClick = () => {
    const copyBtn = document.querySelector(".copy-source-text");
    const initialCopyBtnText = copyBtn.innerHTML;
    copyBtn.innerText = "Copied!";
    copyBtn.blur();
    setTimeout(() => {
      copyBtn.innerHTML = initialCopyBtnText;
    }, 2e3);
  };

  render() {
    const {
      open,
      sourceText,
      handleCloseModal,
      numberSourceEntries,
    } = this.props;
    return (
      <Modal open={open} closeIcon onClose={handleCloseModal}>
        <Modal.Content scrolling>
          <Modal.Description>
            <Header>
              Source text (number of entries: {numberSourceEntries})
            </Header>
            <p>{sourceText}</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <CopyToClipboard text={sourceText}>
            <Button
              primary
              onClick={() => this.handleClick()}
              className="copy-source-text"
            >
              <Icon name="clipboard" /> Copy
            </Button>
          </CopyToClipboard>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default SourceTextModal;
