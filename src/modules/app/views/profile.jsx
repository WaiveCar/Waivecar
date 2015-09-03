'use strict';

import React         from 'react';
import ProfileHeader from './components/profile/header';
import CardRide      from './components/profile/card-ride';
import { Layout }    from 'reach-components';

let { Row, Column } = Layout;

export default class ProfileView extends React.Component {

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
      <div id="profile">
        <ProfileHeader />

        <div className="container">
          
          <section className="past-rides">
            <h2>Previous Rides</h2>
            <Row>
              {
                this.state.rides.map((ride, i) => {
                  return (
                    <Column key={ i } width={ 3 }>
                      <CardRide ride={ ride } />
                    </Column>
                  )
                })
              }
            </Row>
          </section>

        </div>

      </div>
    )
  }
}