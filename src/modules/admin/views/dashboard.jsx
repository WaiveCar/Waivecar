import React from 'react';

import { Charts, Layout } from 'reach-components';
import { Link }           from 'react-router';

let { Container, Row, Column } = Layout;
let { MiniChart } = Charts;

export default class DashboardView extends React.Component {
  render() {
    return (
      <Container>
        <Row>
          <Column width={ 3 }>
            <MiniChart></MiniChart>
          </Column>
        </Row>
      </Container>
    );
  }
}