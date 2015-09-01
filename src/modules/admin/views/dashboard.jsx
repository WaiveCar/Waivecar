import React              from 'react';
import ReactDom           from 'react-dom';
import { Charts, Layout } from 'reach-components';
import { Link }           from 'react-router';
import map                from './map';

let { Container, Row, Column } = Layout;
let { Chart, MiniChart } = Charts;

let users = {
  title : 'User Registrations',
  count : 1234,
  data  : []
};

for(let i = 0; i < 21; i++) {
  users.data.push(Math.random(1, 100));
};

let resource = {
  name : 'cars',
  index : {
    method : 'GET',
    uri    : '/cars'
  },
  show : {
    method : 'GET',
    uri    : '/cars/:id'
  },
  create : {
    method : 'POST',
    uri    : '/cars'
  },
  update : {
    method : 'PUT',
    uri    : '/cars/:id'
  },
  destroy : {
    method : 'DELETE',
    uri    : '/cars/:id'
  }
};


export default class DashboardView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      width : 0
    };
  }

  componentDidMount() {
    this.setState({
      width : ReactDom.findDOMNode(this).offsetWidth
    });
  }

  render() {
    let Map = map('map', null, resource);
    return (
      <Container>
        <Row>
          <Column>
            <Chart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } width={ this.state.width } className="chart-yellow"></Chart>
          </Column>
        </Row>
        <Row>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-pink"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-bluegray"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } className="chart-info"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'line' } className="chart-warning"></MiniChart>
          </Column>
        </Row>
        <Row>
          <Column>
            <Map />
          </Column>
        </Row>
      </Container>
    );
  }
}