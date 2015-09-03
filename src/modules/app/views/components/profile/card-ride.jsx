'use strict';

import React from 'react';

export default class CardRide extends React.Component {
  render() {
    let { title, image, stats } = this.props.ride;
    return (
      <div className="card animated zoomIn" style={{ background : 'url(/images/profile/'+ (image || 'profile-menu.png') +') center center / cover' }}>
        <div className="card-content">
          <div className="card-title">
            { title }
          </div>
          <ul>
            {
              stats.map((stat, i) => {
                return (
                  <li>
                    { stat.title ? <div className="card-stat-title">{ stat.title }</div> : null }
                    { stat.value }
                  </li>
                )
              })
            }
          </ul>
          <div className="card-actions">
            <button className="btn btn-primary">Details</button>
          </div>
        </div>
      </div>
    );
  }
}