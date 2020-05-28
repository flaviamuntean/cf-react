import WindowUtils from "./WindowUtils";

export default class CookieUtils {
  static readUserStateFromCookies = () => {
    const cookies = WindowUtils.getCookies();
    const spaceKey = `space_id`;
    const accessKey = `access_token`;
    const space = `space`;
    const environment = `environment`;

    return {
      spaceID: cookies[spaceKey] || "",
      accessToken: cookies[accessKey] || "",
      space: cookies[space] || "",
      environment: cookies[environment] || "",
    };
  };
}
