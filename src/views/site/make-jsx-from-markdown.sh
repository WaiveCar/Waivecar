#!/bin/bash
for file in *.md; do
  echo "...$file"
  name=${file/.md/}
  ucfirst_name=`sed 's/\(.\)/\U\1/' <<< "$name"`
{
  cat << ENDL
import React, { Component } from 'react';

module.exports = class $ucfirst_name extends Component {
  render() {
    return (
      <div className='container'>
        <div className='row'>
          <div className="col-xs-12 col-md-8 col-md-push-2 faq">
ENDL
pandoc $file | sed s'/^/          /' | sed s/'a href/a target="_blank" href/g'
cat << ENDL
          </div>
        </div>
      </div>
    );
  }
}
ENDL
} > $name.jsx
done
