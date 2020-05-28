export default class WindowUtils {
  // static anyParams = () => window.location.search;

  // static scrollToTop = () => window.scrollTo(0, 0);

  // static alert = (message) => window.alert(message);

  // static replaceLocation = (path) => {
  //   window.location = path;
  // };

  // static reload = () => window.location.reload();

  static getCookies = () => {
    return Object.assign(
      {},
      ...document.cookie.split("; ").map((cookie) => {
        const name = cookie.split("=")[0];
        const value = cookie.split("=")[1];

        return { [name]: value };
      })
    );
  };

  static setCookie = (key, value, expires) => {
    document.cookie = `${key}=${value};expires=${expires};path=/`;
  };
}
