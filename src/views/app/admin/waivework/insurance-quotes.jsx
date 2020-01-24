import React, {Component} from 'react';
import {api, relay} from 'bento';
import {Link} from 'react-router';
import Table from 'bento-service/table';
import ThSort from '../components/table-th';

class InsuranceQuotes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: null,
      sort: {
        key: null,
        order: 'DESC',
      },
      more: false,
      offset: 0,
    };
    this.table = new Table(this, 'insuranceQuotes', null, '/insuranceQuotes');
    relay.subscribe(this, 'insuranceQuotes');
  }

  componentDidMount() {
    this.table.init();
    this.setState({
      sort: {
        key: 'createdAt',
        order: 'DESC',
      },
      searchObj: {
        order: 'id,DESC',
      },
    });
  }
  row(quote) {
    return (
      <tr key={quote.id}>
        <td>
          {quote.user ? (
            <Link
              to={`/users/${quote.user.id}`}>{`${quote.user.firstName} ${quote.user.lastName}`}</Link>
          ) : (
            `${quote.waitlist.firstName} ${quote.waitlist.lastName}`
          )}
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div id="waitlist-list" className="container">
        <div className="box full">
          <div className="col-md-12">
            <h3>Insurance Quotes</h3>
          </div>
          <div>
            <div className="box-content">
              <input
                type="text"
                className="box-table-search"
                ref={input => {
                  this.textInput = input;
                }}
                placeholder="Enter search text [name, email]"
                onChange={e => {
                  this.table.search(
                    false,
                    this.textInput.value || ' ',
                    this.textInput,
                  );
                }}
              />
              <div id="isMobile" className="hidden-sm-down"></div>
              <table className="box-table table-striped">
                <thead>
                  <tr ref="sort">
                    <ThSort sort="name" value="Name" ctx={this} />
                  </tr>
                </thead>
                <tbody>{this.table.index()}</tbody>
              </table>
              {this.state.more ? (
                <div className="text-center" style={{marginTop: 20}}>
                  <button
                    className="btn btn-primary"
                    onClick={() => this.table.more(false)}>
                    Load More
                  </button>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default InsuranceQuotes;
