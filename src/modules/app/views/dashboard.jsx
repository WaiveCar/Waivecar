'use strict';

import React                       from 'react';
import ReactDom                    from 'react-dom';
import Reach                       from 'reach-react';
import { Charts, Layout, Mapping } from 'reach-components';
import { Link }                    from 'react-router';

let { Row, Column }      = Layout;
let { Chart, MiniChart } = Charts;
let Relay                = Reach.Relay;
let actions              = Relay.getActions();

export default class DashboardView extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = { width : 0 };
    Relay.subscribe(this, [ 'cars', 'users' ]);
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({ width : this.refs.dashboard.offsetWidth });
    this.dispatch('users', actions.USERS_INDEX);
    this.dispatch('cars',  actions.CARS_INDEX);
  }

  /**
   * Fetches the resource form the API and dispatches the result to the Relay.
   * @method dispatch
   * @param  {String}   resource
   * @param  {Function} action
   */
  dispatch(resource, action) {
    Reach.API.get('/' + resource, function (err, cars) {
      if (err) { return console.log(err); }
      Relay.dispatch(resource, action(cars));
    });
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    Relay.unsubscribe(this, [ 'cars', 'users' ]);
  }

  /**
   * @method render
   */
  render() {
    return (
      <div className="container" ref="dashboard">
        <Row>
          <Column>
            <Chart title={ 'Users' } data={ this.state.users } chartType={ 'line' } width={ this.state.width } className="chart-yellow"></Chart>
          </Column>
        </Row>
        <Row>
          <Column width={ 3 }>
            <MiniChart title={ 'Users' } data={ this.state.users } chartType={ 'bar' } className="chart-pink" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ 'Users' } data={ this.state.users } chartType={ 'bar' } className="chart-bluegray" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ 'Users' } data={ this.state.users } chartType={ 'line' } className="chart-info" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ 'Users' } data={ this.state.users } chartType={ 'line' } className="chart-warning" />
          </Column>
        </Row>
        <Mapping markerIcon="/images/admin/map-icon-waivecar.svg" markers={ this.state.cars } />
      </div>
    );
  }
}