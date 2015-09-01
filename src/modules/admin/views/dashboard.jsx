import React                       from 'react';
import ReactDom                    from 'react-dom';
import Reach                       from 'reach-react';
import { Charts, Layout, Mapping } from 'reach-components';
import { Link }                    from 'react-router';

let { Container, Row, Column } = Layout;
let { Chart, MiniChart }       = Charts;
let Relay                      = Reach.Relay;

let users = {
  title : 'User Registrations',
  count : 1234,
  data  : []
};

for(let i = 0; i < 21; i++) {
  users.data.push(Math.random(1, 100));
};

export default class DashboardView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      width : 0
    };
    Relay.subscribe(this, 'cars');
  }

  componentDidMount() {
    this.setState({
      width : ReactDom.findDOMNode(this).offsetWidth
    });
    Reach.API.get('/cars', function (err, cars) {
      if (err) {
        return;
      }
      Relay.dispatch('cars', {
        type : 'index',
        cars : cars
      });
    });
  }

  componentWillUnmount() {
    Relay.unsubscribe(this, 'cars');
  }

  render() {
    return (
      <Container>
        <Row>
          <Column>
            <Chart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } width={ this.state.width } className="chart-yellow"></Chart>
          </Column>
        </Row>
        <Row>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-pink" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-bluegray" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } className="chart-info" />
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } className="chart-warning" />
          </Column>
        </Row>
        <Mapping markerIcon="/images/admin/map-icon-waivecar.svg" markers={ this.state.cars } />
      </Container>
    );
  }
}