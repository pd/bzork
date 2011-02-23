/** @namespace */
var bzork = {
  /** Current release version */
  version: "0.1",

  /** @namespace */
  vm: {},

  /** @namespace Debugging functions for use with Chrome/FireBug console */
  Debug: {
    /** Off by default
     * @private
     */
    enabled: false,

    /** Turn debugging on */
    enable: function() { bzork.Debug.enabled = true; },
    /** Turn debugging off */
    disable: function() { bzork.Debug.enabled = false; },

    /** console.log */
    log: function() {
      if (bzork.Debug.enabled)
        console.log.apply(console, arguments);
    },

    /** console.group */
    group: function() {
      if (bzork.Debug.enabled)
        console.group.apply(console, arguments);
    },

    /** console.groupCollapsed */
    groupCollapsed: function() {
      if (bzork.Debug.enabled)
        console.groupCollapsed.apply(console, arguments);
    },

    /** console.groupEnd */
    groupEnd: function() {
      if (bzork.Debug.enabled)
        console.groupEnd.apply(console);
    }
  }
};
