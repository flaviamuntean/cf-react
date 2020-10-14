import React, { Component } from "react";
import PropTypes from "prop-types";
import AuthDetails from "../AuthDetails/AuthDetails";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";
import Helpers from "../../utils/Helpers";
import ExportMeta from "../ExportMeta/ExportMeta";
import Import from "../Import/Import";
import EntryTagger from "../EntryTagger/EntryTagger";
import ErrorMsg from "../ErrorMsg/ErrorMsg";
import { createClient } from "contentful-management";

import "./Integration.css";

class Integration extends Component {
  static propTypes = {
    accessToken: PropTypes.string.isRequired,
    openAuthModal: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      // basic states
      spaces: [],
      selectedSpace: "",
      spaceObject: null,
      environments: [],
      selectedEnvironment: "",
      environmentObject: null,
      // tags
      tags: [],
      selectedMetaTags: [],
      // export options
      contentTypes: [],
      // locales
      locales: [],
      sourceLocale: "",
      // errors
      showErrorMsg: false,
      errorMsgContent: "",
    };
  }

  componentDidMount() {
    this.getInitialIntegrationDetails();
    window.onbeforeunload = function () {
      window.scrollTo(0, 0);
    };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.accessToken !== this.props.accessToken) {
      window.scrollTo(0, 0);
      this.setInitState();
      this.getInitialIntegrationDetails();
    }
  };

  setInitState = () => {
    this.setState({
      spaces: [],
      selectedSpace: "",
      spaceObject: null,
      environments: [],
      selectedEnvironment: "",
      environmentObject: null,
      contentTypes: [],
      showErrorMsg: false,
      errorMsgContent: "",
      tags: [],
      selectedMetaTags: [],
    });
  };

  getInitialIntegrationDetails = () => {
    if (this.props.accessToken) {
      this.managementClient = createClient({
        accessToken: this.props.accessToken,
      });
      this.getSpaces();
      const cookieData = CookieUtils.readUserStateFromCookies();
      const { space, environment } = cookieData;

      this.setState({ selectedSpace: space, selectedEnvironment: environment });

      if (space) {
        this.managementClient
          .getSpace(space)
          .then((space) => this.setState({ spaceObject: space }));
        this.getEnvironments(space);
      }

      if (space && environment) {
        this.managementClient
          .getSpace(space)
          .then((space) => space.getEnvironment(environment))
          .then((environment) => {
            this.setState({ environmentObject: environment });
            this.getContentTypesAndLocales(environment);
            this.getMetaTags(environment);
          });
      }
    }
  };

  getMetaTags = (environmentObject) => {
    environmentObject
      .getTags()
      .then((tags) => {
        this.setState({ tags: Helpers.generateTagsForDropdown(tags) });
      })
      .catch(() =>
        this.setState({
          showErrorMsg: true,
          errorMsgContent:
            "Something went wrong fetching the tags. Please refresh the page and try again.",
        })
      );
  };

  getContentTypesAndLocales = (environmentObject) => {
    this.getContentTypes(environmentObject);
    this.getLocales(environmentObject);
  };

  // Display the first section of the integration
  displayAuthDetails = () => {
    const { openAuthModal } = this.props;
    const {
      spaces,
      environments,
      selectedSpace,
      selectedEnvironment,
    } = this.state;

    return (
      <AuthDetails
        changeToken={openAuthModal}
        spaces={spaces}
        environments={environments}
        selectedSpace={selectedSpace}
        selectedEnvironment={selectedEnvironment}
        handleSpaceSelection={this.handleSpaceSelection}
        handleEnvironmentSelection={this.handleEnvironmentSelection}
      />
    );
  };

  // Get all spaces for the token
  getSpaces = () => {
    this.managementClient
      .getSpaces()
      .then((spaces) => {
        const dropdownCategories = Helpers.generateSpacesDropdown(spaces);
        this.setState({ spaces: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
        // Remove all information on spaces and environments if the spaces are not fetched (most likely due to the token being invalid)
        this.setInitState();
        this.setState({
          showErrorMsg: true,
          errorMsgContent:
            "The access token you entered could not be found or is invalid. Please ensure you have the correct token and try again.",
        });
      });
  };

  // Select a space
  handleSpaceSelection = (e, { value }) => {
    this.setState({ selectedSpace: value }, () => {
      WindowUtils.setCookie(`space`, value, 180);
    });
    this.setState({
      selectedEnvironment: "",
      sourceLocale: "",
      contentTypes: [],
    });
    if (value) {
      this.managementClient
        .getSpace(value)
        .then((space) => this.setState({ spaceObject: space }));
      // Clear the environment cookie
      WindowUtils.setCookie(`environment`, "", 180);
      this.getEnvironments(value);
    }
  };

  // Get environments for the space
  getEnvironments = (space) => {
    this.managementClient
      .getSpace(space)
      .then((space) => space.getEnvironments())
      .then((environments) => {
        const dropdownCategories = Helpers.generateEnvironmentsDropdown(
          environments
        );
        this.setState({ environments: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Select an environment
  handleEnvironmentSelection = (e, { value }) => {
    this.setState({ selectedEnvironment: value }, () => {
      WindowUtils.setCookie(`environment`, value, 180);
    });
    this.setState({
      contentTypes: [],
      tags: [],
      selectedMetaTags: [],
    });
    if (value) {
      const { spaceObject } = this.state;
      spaceObject.getEnvironment(value).then((environment) => {
        this.setState({ environmentObject: environment });
        this.getContentTypesAndLocales(environment);
        this.getMetaTags(environment);
      });
    }
  };

  // EXPORT OPTIONS

  getContentTypes = (environment) => {
    environment
      .getContentTypes()
      .then((contentTypes) => {
        const dropdownCategories = Helpers.generateContentTypesDropdown(
          contentTypes
        );
        this.setState({ contentTypes: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  getLocales = (environment) => {
    environment
      .getLocales()
      .then((locales) => {
        const dropdownCategories = Helpers.generateLocalesDropdown(locales);
        this.setState({ locales: dropdownCategories });
      })
      .catch((e) => {
        console.log(e);
      });
  };

  addToState = (name, value) => {
    this.setState({ [name]: value });
  };

  exportMeta = () => {
    const { contentTypes, locales, tags, environmentObject } = this.state;

    return (
      <ExportMeta
        environmentObject={environmentObject}
        addToIntegrationState={this.addToState}
        contentTypes={contentTypes}
        locales={locales}
        tags={tags}
      />
    );
  };

  import = () => {
    const { locales, environmentObject, tags } = this.state;

    return (
      <Import
        locales={locales}
        environmentObject={environmentObject}
        tags={tags}
      />
    );
  };

  entryTagger = () => {
    const { tags, environmentObject } = this.state;

    return <EntryTagger tags={tags} environmentObject={environmentObject} />;
  };

  render() {
    const { showErrorMsg, errorMsgContent } = this.state;

    return (
      <div>
        <ErrorMsg content={errorMsgContent} visible={showErrorMsg} />
        {this.displayAuthDetails()}
        {this.exportMeta()}
        {this.import()}
        {this.entryTagger()}
      </div>
    );
  }
}

export default Integration;
