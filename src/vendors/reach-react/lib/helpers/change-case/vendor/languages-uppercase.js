module.exports = {
  tr : {
    regexp : /[\u0069]/g,
    map    : {
      '\u0069' : '\u0130'
    }
  },
  az : {
    regexp : /[\u0069]/g,
    map    : {
      '\u0069' : '\u0130'
    }
  },
  lt : {
    regexp : /[\u0069\u006A\u012F]\u0307|\u0069\u0307[\u0300\u0301\u0303]/g,
    map    : {
      '\u0069\u0307'       : '\u0049',
      '\u006A\u0307'       : '\u004A',
      '\u012F\u0307'       : '\u012E',
      '\u0069\u0307\u0300' : '\u00CC',
      '\u0069\u0307\u0301' : '\u00CD',
      '\u0069\u0307\u0303' : '\u0128'
    }
  }
};