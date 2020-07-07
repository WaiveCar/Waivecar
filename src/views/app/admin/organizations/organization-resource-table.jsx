import React, {Component} from 'react';
import {api, relay} from 'bento';
import Table from 'bento-service/table';

class OrganizationResource extends Component {
  constructor(props) {
    super(props);
    this.state = {
      offset: 0,
      more: false,
      loaded: false,
    };
    this.row = this.props.row;
    this.table = new Table(
      this,
      this.props.resource,
      null,
      `/${this.props.resourceUrl}?organizationIds=[${
        this.props.organizationId
      }]${this.props.queryOpts ? this.props.queryOpts : ''}`,
      10,
    );
    relay.subscribe(this, this.props.resource);
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

  render() {
    let rows = this.table.index();
    let {loaded} = this.state;
    let {resource} = this.props;
    return (
      <div>
        <table className="box-table table-striped">
          <thead>{this.props.header()}</thead>
          <tbody>
            {rows.length ? (
              rows
            ) : (
              <tr>
                <td colSpan={'100%'} style={{textAlign: 'center'}}>{loaded? `No ${resource} found.` : 'Loading...'}</td>
              </tr>
            )}
          </tbody>
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
    );
  }
}

export default OrganizationResource;
