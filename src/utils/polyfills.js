// Check if we're running on the server side
if (typeof window === "undefined") {
  if (typeof localStorage === "undefined") {
    global.localStorage = {
      getItem: function (key) {
        return null; // Return null for SSR
      },
      setItem: function (key, value) {
        // Do nothing for SSR
      },
      removeItem: function (key) {
        // Do nothing for SSR
      },
      clear: function () {
        // Do nothing for SSR
      },
    };
  }
}
