import React             from 'react';
import moment            from 'moment';
import { api, relay, dom }    from 'bento';
import Table             from 'bento-service/table';
import mixin             from 'react-mixin';
import { History, Link } from 'react-router';
import { snackbar }      from 'bento-web';
import ThSort            from '../components/table-th';

@mixin.decorate(History)
class TableIndex extends React.Component {

  constructor(...args) {
    super(...args);
    this.table = new Table(this, 'waitlist', null, '/waitlist');
    this.state = {
      search : null,
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0,
    };
    relay.subscribe(this, 'waitlist');
  }

  componentDidMount() {
    this.table.init();
    dom.setTitle("Waitlist");
    this.setState({
      sort : {
        key   : 'id',
        order : 'ASC'
      },
      searchObj: {
        order: 'id,DESC'
      }
    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'waitlist');
  }

  letinreal(opts) {
    api.post('/waitlist/letIn', opts, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      } else {
        location.reload();
      }
    }); 
  }

  letinbyid(id) {
    this.letinreal({idList: [id]});
  }

  letin() {
    let amount = prompt("How many people do you want to let in?");
    if(amount) {
      amount = parseInt(amount, 10);
    }
    if(amount) {
      this.letinreal({amount: amount})
    }
  }

  isMobile() {
    return window.getComputedStyle(document.getElementById('isMobile')).display === 'none';
  }

  row(waitlist) {
    return (
      <tr key={ waitlist.id }>
        <td className="hidden-sm-down">{ waitlist.firstName } { waitlist.lastName }</td>
        <td className="hidden-sm-down">{ waitlist.placeName }</td>
        <td className="hidden-sm-down">{ moment(waitlist.createdAt).format('YYYY-MM-DD HH:mm:ss') }</td>
        <td className="hidden-sm-down">
          <a style={{ cursor: 'pointer' }} onClick={ this.letinbyid.bind(this, waitlist.id) }>
            Let In
          </a>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <div id="waitlist-list" className="container">
        <div className="box full">
          <div className='col-md-8'>
            <h3>Waitlist</h3>
          </div>
          <div className='col-md-4 pull-right'>
            <button type="submit" onClick={ this.letin.bind(this) } className="btn btn-primary"> Let People in</button>
          </div>
          <div className="box-content">
            <input 
              type="text" 
              className="box-table-search" 
              ref={(input) => { this.textInput = input; }}
              placeholder="Enter search text [name, email" 
              onChange={ (e) => { this.table.search(false, this.textInput.value, this.textInput) }  } />
            <div id="isMobile" className="hidden-sm-down"></div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="name"     value="Name"     ctx={ this } className="hidden-sm-down" />
                  <ThSort sort="location" value="Location" ctx={ this } />
                  <ThSort sort="date"     value="Date"     ctx={ this } />
                  <th className="hidden-sm-down"></th>
                </tr>
              </thead>
              <tbody>
                { this.table.index() }
              </tbody>
            </table>
            {
              this.state.more ?
                <div className="text-center" style={{ marginTop : 20 }}>
                  <button className="btn btn-primary" onClick={ () => this.table.more(false) }>Load More</button>
                </div>
                :
                ''
            }
          </div>
        </div>
      </div>
    );
  }

};

module.exports = TableIndex;
