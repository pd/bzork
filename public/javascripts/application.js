jQuery(document).ready(function() {
  if (typeof bzork_options === "undefined")
    return;

  var machine = null;
  $.ajax({
    url: bzork_options.story,
    async: false,
    dataType: 'binary',
    success: function(buf) { machine = new bzork.Machine(buf); }
  });

  machine.useUI(bzork.ui.Browser);

  window.bmachine = machine;
  machine.run('debug-mode');
});
