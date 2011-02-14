bzork.Loader = function(data) {
  this.blob = data;
  this.dataView = new jDataView(this.blob);
};

bzork.Loader.prototype.loadStory = function() {
  var story = new bzork.Story();
  story.zcodeVersion = this.dataView.getUint8();
  return story;
};
