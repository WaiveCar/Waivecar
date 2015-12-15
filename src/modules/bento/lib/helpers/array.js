module.exports = {

  /**
   * @source <http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript>
   * @param  {Array} source
   * @param  {Array} target
   * @return {Boolean}
   */
  equals(source, target) {
    if (!target) {
      return false; // if the other array is a falsy value, return
    }
    if (source.length != target.length) {
      return false; // compare lengths - can save a lot of time
    }
    for (var i = 0, l=source.length; i < l; i++) {
      // Check if we have nested arrays
      if (source[i] instanceof Array && target[i] instanceof Array) {
        if (!source[i].equals(target[i])) {
          return false;
        }
      } else if (source[i] != target[i]) {
        return false; // Warning - two different object instances will never be equal: {x:20} != {x:20}
      }
    }
    return true;
  }

};
