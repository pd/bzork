var bzork = (function() {
  // Set up namespaces and suchlike
  return {
    vm: {},
    ui: {},
    version: "0.1",

    Debug: {
      enabled: false,
      enable: function() { bzork.Debug.enabled = true; },
      disable: function() { bzork.Debug.enabled = false; },
      log: function() {
        if (bzork.Debug.enabled)
          console.log.apply(console, arguments);
      },
      group: function() {
        if (bzork.Debug.enabled)
          console.group.apply(console, arguments);
      },
      groupCollapsed: function() {
        if (bzork.Debug.enabled)
          console.groupCollapsed.apply(console, arguments);
      },
      groupEnd: function() {
        if (bzork.Debug.enabled)
          console.groupEnd.apply(console);
      }
    }
  };
})();
