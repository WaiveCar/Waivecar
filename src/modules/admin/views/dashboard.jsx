import React from 'react';

import { Charts, Layout } from 'reach-components';
import { Link }           from 'react-router';

let { Container, Row, Column } = Layout;
let { MiniChart } = Charts;

let users = {
  title : 'User Registrations',
  count : 1234,
  data  : []
};

for(let i = 0; i < 21; i++) {
  users.data.push(Math.random(1, 100));
};

export default class DashboardView extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-pink"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } chartType={ 'bar' } className="chart-bluegray"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } className="chart-info"></MiniChart>
          </Column>
          <Column width={ 3 }>
            <MiniChart title={ users.title } data={ users.data } total={ users.count } className="chart-warning"></MiniChart>
          </Column>
        </Row>
      </Container>
    );
  }
}