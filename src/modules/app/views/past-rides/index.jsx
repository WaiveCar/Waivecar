'use strict';

import React      from 'react';
import Components from 'reach-components';
import Card       from './card';

let { Row, Column } = Components.Layout;

export default class Rides extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      rides : [
        {
          title : 'June 13th, 2015 @ 9:55pm',
          image : 'ride-dusk.jpg',
          stats : [
            {
              title : 'From',
              value : 'E Olympic Blvd',
              icon  : 'directions_car'
            },
            {
              title : 'To',
              value : 'James M Wood Blvd',
              icon  : 'directions_car'
            }
          ]
        },
        {
          title : 'March 22nd, 2015 @ 1:40am',
          image : 'ride-night.jpg',
          stats : [
            {
              title : 'From',
              value : 'E Olympic Blvd',
              icon  : 'directions_car'
            },
            {
              title : 'To',
              value : 'James M Wood Blvd',
              icon  : 'directions_car'
            }
          ]
        },
        {
          title : 'February 3rd, 2015 @ 2:54pm',
          image : 'ride-day.jpg',
          stats : [
            {
              title : 'From',
              value : 'E Olympic Blvd',
              icon  : 'directions_car'
            },
            {
              title : 'To',
              value : 'James M Wood Blvd',
              icon  : 'directions_car'
            }
          ]
        },
        {
          title : 'January 2nd, 2015 @ 6:38am',
          image : 'ride-dawn.jpg',
          stats : [
            {
              title : 'From',
              value : 'E Olympic Blvd',
              icon  : 'directions_car'
            },
            {
              title : 'To',
              value : 'James M Wood Blvd',
              icon  : 'directions_car'
            }
          ]
        }
      ]
    }
  }
  
  render() {
    return (
      <div id="past-rides" className="container-fluid">
        <h1>Past Rides</h1>
        <Row>
          {
            this.state.rides.map((ride, i) => {
              return (
                <Column key={ i } width={ 4 }>
                  <Card ride={ ride } />
                </Column>
              )
            })
          }
        </Row>
      </div>
    );
  }
}