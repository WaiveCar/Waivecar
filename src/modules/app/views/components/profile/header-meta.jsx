'use strict';

import React from 'react';
import Reach from 'reach-react';

let auth = Reach.Auth;

export default class HeaderMeta extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      stats : []
    }
  }

  componentDidMount() {
    this.setState({
      stats : [
        {
          text : '4 Rides Completed',
          icon : 'directions_car'
        },
        {
          text : '288 Miles Driven',
          icon : 'explore'
        },
        {
          text : '88 Galons Saved',
          icon : 'local_gas_station'
        }
      ]
    });
  }

  render() {
    return (
      <div className="header-meta animated flipInX">
        <div className="header-meta-name">
          { auth.user.firstName } { auth.user.lastName }
        </div>
        <div className="header-meta-stats">
          {
            this.state.stats.map((stat, i) => {
              return (
                <div key={ i } className="header-meta-box">
                  <i className="material-icons" role={ stat.icon }>{ stat.icon }</i>
                  { stat.text }
                </div>
              );
            })
          }
        </div>
      </div>
    );
  }
}