{
  cat << ENDL
import React, { Component } from 'react';

module.exports = class Faq extends Component {
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className="col-xs-12 col-md-8 col-md-push-2 faq">
ENDL
pandoc faq.md | sed s'/^/          /'
cat << ENDL
          </div>
        </div>
      </div>
    );
  }
}
ENDL
} > faq.jsx
