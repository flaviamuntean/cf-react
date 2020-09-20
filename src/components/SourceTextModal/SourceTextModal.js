import React, { Component } from "react";
import { Modal, Icon, Button, Placeholder } from "semantic-ui-react";
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

  displayModal = () => {
    const {
      open,
      sourceText,
      handleCloseModal,
      numberSourceEntries,
      sourceIds,
      loading,
    } = this.props;

    const data =
      "data:text/json;charset=utf-8," + encodeURIComponent(sourceText);

    const sourceIdsData =
      "data:text/txt;charset=utf-8," + encodeURIComponent(sourceIds.join());

    if (loading) {
      return (
        <Modal open={open} closeIcon onClose={handleCloseModal}>
          <Modal.Header>Source text</Modal.Header>
          <Modal.Content>
            <Placeholder fluid>
              <Placeholder.Paragraph>
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Paragraph>
              <Placeholder.Paragraph>
                <Placeholder.Line />
                <Placeholder.Line />
                <Placeholder.Line />
              </Placeholder.Paragraph>
            </Placeholder>
          </Modal.Content>
        </Modal>
      );
    } else {
      return (
        <Modal open={open} closeIcon onClose={handleCloseModal}>
          <Modal.Header>
            Source text (number of entries: {numberSourceEntries})
          </Modal.Header>
          <Modal.Content scrolling>
            <Modal.Description>
              <p style={{ whiteSpace: "pre" }}>{sourceText}</p>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <a
              href={sourceIdsData}
              download="entry_ids.txt"
              style={{ color: "white" }}
            >
              <Button primary>
                <Icon name="download" />
                Download Entry IDs
              </Button>
            </a>
            <a href={data} download="source.json" style={{ color: "white" }}>
              <Button primary>
                <Icon name="download" />
                Download JSON
              </Button>
            </a>
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
  };

  render() {
    return this.displayModal();
  }
}

export default SourceTextModal;
