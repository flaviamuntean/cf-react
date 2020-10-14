import React, { Component } from "react";
import PropTypes from "prop-types";
import { Modal, Header, Icon } from "semantic-ui-react";
import AuthDetails from "../AuthDetails/AuthDetails";
import CookieUtils from "../../utils/CookieUtils";
import WindowUtils from "../../utils/WindowUtils";
import Helpers from "../../utils/Helpers";
import ExportMeta from "../ExportMeta/ExportMeta";
import Import from "../Import/Import";
import SourceTextModal from "../SourceTextModal/SourceTextModal";
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
      entryIdsForTagging: "",
      selectedTagsForTagging: [],
      // export options
      contentTypes: [],
      // locales
      locales: [],
      sourceLocale: "",
      // modals
      openSourceTextModal: false,
      sourceTextModalLoading: false,
      sourceText: "",
      sourceIds: [],
      numberSourceEntries: 0,
      confirmationModalOpen: false,
      confirmationModalText: "",
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
      .then((tags) =>
        this.setState({ tags: Helpers.generateTagsForDropdown(tags) })
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

  setSourceLocale = (e, { value }) => {
    this.setState({ sourceLocale: value });
  };

  handleCloseSourceTextModal = () => {
    this.setState({
      openSourceTextModal: false,
      sourceText: "",
      numberSourceEntries: 0,
      sourceLocale: "",
      selectedMetaTags: [],
    });
  };

  confirmationModal = () => {
    const { confirmationModalOpen, confirmationModalText } = this.state;
    return (
      <Modal
        basic
        open={confirmationModalOpen}
        size="small"
        onClose={() => this.setState({ confirmationModalOpen: false })}
      >
        <Header icon>
          <Icon
            name={
              confirmationModalText.includes("Error")
                ? "exclamation"
                : "checkmark"
            }
          />
          {confirmationModalText.includes("Error") ? "Error" : "Success"}
        </Header>
        <Modal.Content style={{ textAlign: "center" }}>
          {confirmationModalText}
        </Modal.Content>
      </Modal>
    );
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

  setEntryIdsForTagging = (e) => {
    this.setState({ entryIdsForTagging: e.target.value });
  };

  handleApplyingTagsToEntries = () => {
    const {
      entryIdsForTagging,
      environmentObject,
      selectedTagsForTagging,
    } = this.state;
    const ids = entryIdsForTagging.split(",");

    ids.forEach((id) => {
      environmentObject.getEntry(id).then((entry) => {
        const tagsToApply = selectedTagsForTagging.map((t) =>
          this.tagIdToObject(t)
        );

        tagsToApply.forEach((tag) => {
          if (!this.tagExists(entry, tag.sys.id)) {
            entry.metadata.tags.push(tag);
          }
        });

        entry
          .update()
          .then(() =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Tags updated.`,
              entryIdsForTagging: [],
              selectedTagsForTagging: [],
            })
          )
          .catch((error) =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Error: ${error}.`,
            })
          );
      });
    });
  };

  handleRemovingTagsFromEntries = () => {
    const {
      entryIdsForTagging,
      environmentObject,
      selectedTagsForTagging,
    } = this.state;
    const ids = entryIdsForTagging.split(",");

    ids.forEach((id) => {
      environmentObject.getEntry(id).then((entry) => {
        selectedTagsForTagging.forEach((tag) => {
          if (this.tagExists(entry, tag)) {
            // remove the ready tag
            const i = entry.metadata.tags.findIndex(
              (obj) => obj.sys.id === tag
            );
            entry.metadata.tags.splice(i, 1);
          }
        });

        entry
          .update()
          .then(() =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Tags updated.`,
              entryIdsForTagging: [],
              selectedTagsForTagging: [],
            })
          )
          .catch((error) =>
            this.setState({
              confirmationModalOpen: true,
              confirmationModalText: `Error: ${error}.`,
            })
          );
      });
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

  handleMetaExport = async () => {
    const { contentTypes, environmentObject, selectedMetaTags } = this.state;

    this.setState({ openSourceTextModal: true, sourceTextModalLoading: true });

    const tagsForExport = Helpers.generateTagsSelector(selectedMetaTags);

    let allContentForExport = [];
    // map content types into an array of only the content type ids
    const contentTypesArray = contentTypes.map(
      (contentType) => contentType.value
    );

    // for each content type
    let promises = contentTypesArray.map(async (contentType) => {
      // get the localizable fields
      const response = await (
        await environmentObject.getContentType(contentType)
      ).fields;
      const localizable = Helpers.filterByLocalizable(response);

      // if the content type has any localizable fields
      if (localizable.length > 0) {
        // combine the ids of the localizable fields into the query needed for export
        const localizableFields = localizable.map((field) => field.id);

        const fieldsForExport = localizableFields.map(
          (field) => `fields.${field}`
        );

        // export all entries for the content type, but only the localizable fields + filters
        environmentObject
          .getEntries({
            content_type: contentType,
            select: fieldsForExport,
            limit: 1000,
            "metadata.tags.sys.id[all]": tagsForExport,
          })
          .then((entries) => {
            // keep only the fields and the sys info
            let numberExportedEntries = 0;

            const localizableEntries = entries.items
              .map((item) => {
                const id = item.sys.id;
                if (item.fields) {
                  const fields = Helpers.filterByLang(
                    item.fields,
                    this.state.sourceLocale
                  );

                  if (
                    Object.keys(fields).length === 0 &&
                    fields.constructor === Object
                  ) {
                    return null;
                  } else {
                    fields.entryId = id;
                    numberExportedEntries++;
                    return fields;
                  }
                }
                return null;
              })
              .filter((entry) => entry !== null);

            allContentForExport.push(localizableEntries);

            this.setState((prevState, props) => ({
              sourceText: JSON.stringify(allContentForExport.flat(), null, 2),
              sourceIds: allContentForExport.flat().map((e) => e.entryId),
              numberSourceEntries:
                prevState.numberSourceEntries + numberExportedEntries,
            }));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    });
    Promise.all(promises).then(() =>
      this.setState({ sourceTextModalLoading: false })
    );
  };

  setAllTags = (e, { value }) => {
    // Set the metatags used for export
    this.setState({ selectedMetaTags: value });
  };

  setTagsForTagging = (e, { value }) => {
    // Set the metatags used for export
    this.setState({ selectedTagsForTagging: value });
  };

  exportMeta = () => {
    const {
      selectedEnvironment,
      contentTypes,
      selectedMetaTags,
      locales,
      sourceLocale,
      tags,
    } = this.state;

    return (
      <ExportMeta
        selectedEnvironment={selectedEnvironment}
        contentTypes={contentTypes}
        locales={locales}
        sourceLocale={sourceLocale}
        setSourceLocale={this.setSourceLocale}
        // functions
        handleExportDefault={this.handleMetaExport}
        // new
        tags={tags}
        setTags={this.setAllTags}
        selectedTags={selectedMetaTags}
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
    const { tags, entryIdsForTagging, selectedTagsForTagging } = this.state;

    return (
      <EntryTagger
        entryIdsForTagging={entryIdsForTagging}
        setEntryIdsForTagging={this.setEntryIdsForTagging}
        // tags
        tags={tags}
        setTagsForTagging={this.setTagsForTagging}
        selectedTagsForTagging={selectedTagsForTagging}
        handleApplyingTagsToEntries={this.handleApplyingTagsToEntries}
        handleRemovingTagsFromEntries={this.handleRemovingTagsFromEntries}
      />
    );
  };

  render() {
    const {
      openSourceTextModal,
      sourceText,
      numberSourceEntries,
      showErrorMsg,
      errorMsgContent,
      sourceTextModalLoading,
      sourceIds,
    } = this.state;

    return (
      <div>
        <ErrorMsg content={errorMsgContent} visible={showErrorMsg} />
        {this.displayAuthDetails()}
        {this.exportMeta()}
        <SourceTextModal
          open={openSourceTextModal}
          loading={sourceTextModalLoading}
          sourceText={sourceText}
          sourceIds={sourceIds}
          numberSourceEntries={numberSourceEntries}
          handleCloseModal={this.handleCloseSourceTextModal}
        />
        {this.import()}
        {this.entryTagger()}
        {this.confirmationModal()}
      </div>
    );
  }
}

export default Integration;
