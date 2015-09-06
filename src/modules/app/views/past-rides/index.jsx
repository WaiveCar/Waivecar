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
          image  : 'ride-dusk.jpg',
          rating : 3,
          points : 120,
          stats  : [
            {
              title : 'From',
              value : 'Sample Street #1',
            },
            {
              title : 'To',
              value : 'Sample Street #2',
            }
          ],
          timestamp : {
            start : {
              day  : 'June 17th',
              time : '9:55pm'
            },
            end : {
              day  : 'June 17th',
              time : '11:02pm'
            }
          }
        },
        {
          image  : 'ride-day.jpg',
          rating : 4,
          points : 180,
          stats  : [
            {
              title : 'From',
              value : 'Sample Street #1',
            },
            {
              title : 'To',
              value : 'Sample Street #2',
            }
          ],
          timestamp : {
            start : {
              day  : 'June 15th',
              time : '3:38pm'
            },
            end : {
              day  : 'June 15th',
              time : '4:48pm'
            }
          }
        },
        {
          image  : 'ride-night.jpg',
          rating : 5,
          points : 320,
          stats  : [
            {
              title : 'From',
              value : 'Sample Street #1',
            },
            {
              title : 'To',
              value : 'Sample Street #2',
            }
          ],
          timestamp : {
            start : {
              day  : 'June 8th',
              time : '11:32pm'
            },
            end : {
              day  : 'June 9th',
              time : '1:28am'
            }
          }
        },
        {
          image  : 'ride-dawn.jpg',
          rating : 2,
          points : 200,
          stats  : [
            {
              title : 'From',
              value : 'Sample Street #1',
            },
            {
              title : 'To',
              value : 'Sample Street #2',
            }
          ],
          timestamp : {
            start : {
              day  : 'June 1st',
              time : '6:00am'
            },
            end : {
              day  : 'June 1st',
              time : '7:02am'
            }
          }
        }
      ]
    }
  }
  
  render() {
    return (
      <div id="past-rides">
        <div className="content-header">
          <h1><span>Past Rides</span></h1>
        </div>
        <div className="container-rides">
          <Row>
            {
              this.state.rides.map((ride, i) => {
                return (
                  <Column key={ i } width={ 6 }>
                    <Card ride={ ride } />
                  </Column>
                )
              })
            }
          </Row>
        </div>
      </div>
    );
  }
}