import React  from 'react';
import IFrame from 'react-iframe';

module.exports = class Terms extends React.Component {
  render() {
    return <IFrame url="/terms.pdf" width="100%" height="100%" />;
  }
};
