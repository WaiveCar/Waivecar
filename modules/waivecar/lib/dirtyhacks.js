'use strict';

class Hacks {

  static button(link, text) {
    return `<a target="_system" href="${link}" class="button-balanced button button-block" style="margin-bottom:-57px;z-index:1000;">${text}</a>`;     
  }

};

module.exports = Hacks;
