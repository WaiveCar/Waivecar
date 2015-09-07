'use strict';

import React from 'react';

export default class Card extends React.Component {

  rating(rating) {
    let stars = [];
    for (let i = 0; i < 5; i++) {
      if (rating > i) {
        stars.push('star');
      } else {
        stars.push('star_border');
      }
    }
    return stars.map((star, i) => {
      return <li key={ i }><i className="material-icons">{ star }</i></li>
    });
  }

  render() {
    let { image, rating, points, stats, timestamp } = this.props.ride;
    return (
      <div className="ride animated fadeIn">
        <div className="ride-img" style={{ background : 'url(/images/profile/'+ image +') center center / cover' }} />
        <div className="ride-body">
          <div className="ride-meta">
            <ul className="ride-rating">
            {
              this.rating(rating)
            }
            </ul>
            <ul className="ride-stats">
            {
              stats.map((stat, i) => {
                return (
                  <li key={ i }>
                    <div className="ride-stat-title">{ stat.title }</div>
                    <div className="ride-stat-value">{ stat.value }</div>
                  </li>
                )
              })
            }
            </ul>
          </div>
        </div>
        <ul className="ride-footer clearfix">
          <li>
            <div className="ride-footer-title">Distance</div>
            38 Miles
          </li>
          <li>
            <div className="ride-footer-title">Started</div>
            { timestamp.start.time }
          </li>
          <li>
            <div className="ride-footer-title">Ended</div>
            { timestamp.end.time }
          </li>
          <li className="ride-footer-green">
            <div className="ride-footer-title">Points</div>
            { points }
          </li>
        </ul>
      </div>
    );
  }
}