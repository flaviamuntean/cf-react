import React, { Component } from "react";
import { Message } from "semantic-ui-react";
import PropTypes from "prop-types";

class ErrorMsg extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    visible: PropTypes.bool.isRequired,
  };

  render() {
    if (this.props.visible) {
      return (
        <Message
          negative
          icon="exclamation"
          header="Error"
          content={this.props.content}
        />
      );
    }

    return null;
  }
}

export default ErrorMsg;
