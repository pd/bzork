_.mixin({
  filterObj : function( obj, reference ) {
    var intersect = _.intersect(reference, _.keys(obj)),
        retObj= {};
    _.map( intersect, function(el) { retObj[el] = obj[el]; })
    return retObj;
  }
});
