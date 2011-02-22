_.mixin({
  filterObj : function( obj, reference ) {
    if ( reference && typeof reference == 'object' ) { reference = _.keys( reference ); }

    var intersect = _.intersect(reference, _.keys(obj)),
        retObj= {};
    _.map( intersect, function(el) { retObj[el] = obj[el]; })

    return retObj;
  }
});
