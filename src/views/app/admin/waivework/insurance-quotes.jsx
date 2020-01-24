import React, {Component} from 'react';
import {api} from 'bento';
import {Link} from 'react-router';
import Table from 'bento-service/table';
import ThSort from '../components/table-th';

class InsuranceQuotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search : null,
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0,
    };
    this.table = new Table(this, 'insuranceQuotes', null, '/insuranceQuotes');
  }

  componentDidMount() {
    this.table.init();
    this.setState({
      sort : {
        key   : 'createdAt',
        order : 'DESC'
      },
      searchObj: {
        order: 'id,DESC',
      }
    });
  }

  render() {
    return null;
  }
}

export default InsuranceQuotes;
