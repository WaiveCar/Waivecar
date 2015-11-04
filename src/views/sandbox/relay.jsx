'use strict';

import React          from 'react';
import { api, relay } from 'bento';

module.exports = class SandboxRelay extends React.Component {

  constructor(...args) {
    super(...args);
    relay.subscribe(this, 'cars');
  }

  componentDidMount() {
    api.get('/cars', (error, list) => {
      if (error) {
        return console.log(error);
      }
      this.cars.index(list);
    }.bind(this));
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'cars');
  }

  render() {
    return (
      <div className="container">
        <h3 style={{ margin : '30px 0' }}>Relay Sandbox</h3>
        {
          this.state.cars.map((val) => {
            return (
              <pre key={ val.id }>
                {
                  JSON.stringify(val, null, 2)
                }
              </pre>
            )
          })
        }
      </div>
    );
  }

}
