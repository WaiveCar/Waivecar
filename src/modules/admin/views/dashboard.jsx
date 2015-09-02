import React                       from 'react';
import ReactDom                    from 'react-dom';
import Reach                       from 'reach-react';
import { Charts, Layout, Mapping } from 'reach-components';
import { Link }                    from 'react-router';

let { Container, Row, Column } = Layout;
let { Chart, MiniChart }       = Charts;
let Relay                      = Reach.Relay;

export default class DashboardView extends React.Component {

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args);
    this.state = {
      width : 0
    };
    Relay.subscribe(this, 'cars');
    Relay.subscribe(this, 'users'); // testing out charting with real data
  }

  /**
   * @method componentDidMount
   */
  componentDidMount() {
    this.setState({
      width  : this.refs.dashboard.offsetWidth
    });

    // TODO: What is our approach for async parallel requests in react?
    // Typically i would use `async` and do `async.parallel([], fn)`;
    Reach.API.get('/cars', function (err, cars) {
      if (err) {
        return;
      }
      Relay.dispatch('cars', {
        type : 'index',
        cars : cars
      });
      Reach.API.get('/users', function (err, users) {
        if (err) {
          return;
        }
        Relay.dispatch('users', {
          type  : 'index',
          users : users
        });
      });
    });
  }

  /**
   * @method componentWillUnmount
   */
  componentWillUnmount() {
    Relay.unsubscribe(this, 'cars');
    Relay.unsubscribe(this, 'users');
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