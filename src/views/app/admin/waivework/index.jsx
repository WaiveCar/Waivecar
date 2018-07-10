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
    this.table = new Table(this, 'waitlist', null, '/waitlist?type=waivework');
    this.state = {
      search : null,
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0,
      noteValue: null,
    };
    relay.subscribe(this, 'waitlist');
  }

  componentDidMount() {
    this.table.init();
    dom.setTitle('Waivework');
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
    let amount = prompt('How many people do you want to let in?');
    if(amount) {
      amount = parseInt(amount, 10);
    }
    if(amount) {
      this.letinreal({
        idList: this.table.data.filter((row) => {
          return row.accountType === 'normal';
        }).map((row) => {
          return row.id;
        }).slice(0, amount)
      });
    }
  }

  isMobile() {
    return window.getComputedStyle(document.getElementById('isMobile')).display === 'none';
  }

  priority(id, direction) {
    api.post('/waitlist/prioritize', { id: id, direction: direction }, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
    }); 
  }

  moreinfo(id) {
    this.setState({
      userSelected: this.table.data.filter((row) => { 
        return row.id === id;
      })[0]
    });
  }

  row(waitlist) {
    return (
      <tr key={ waitlist.id }>
          <td>{ waitlist.firstName } { waitlist.lastName }</td>
          <td className="hidden-sm-down">{ waitlist.placeName }</td> 
          <td className="hidden-sm-down">{ waitlist.hours}</td> 
          <td className="hidden-sm-down">{ waitlist.days}</td> 
          <td className="hidden-sm-down">{ waitlist.experience}</td> 
          <td className="hidden-sm-down">{ moment(waitlist.createdAt).format('YYYY-MM-DD HH:mm:ss') }</td> 
          <td>
          <a style={{ cursor: 'pointer' }} onClick={ this.priority.bind(this, waitlist.id, -1) }>
            &#9660;
          </a>
          <a style={{ cursor: 'pointer' }} onClick={ this.moreinfo.bind(this, waitlist.id) }>
            More Info 
          </a>
          <a style={{ cursor: 'pointer' }} onClick={ this.priority.bind(this, waitlist.id, 1) }>
            &#9650;
          </a>
        </td>
      </tr>
    );
  }

  addNote() {
    api.post('/waitlist/addNote', { id: this.state.userSelected.id, note: this.state.noteValue }, (err, response) => {
      this.setState({
        noteValue: ''
      });
    });
  }


  render() {
    return (
      <div id="waitlist-list" className="container">
        <div className="box full">
          <div className='col-md-12'>
            <h3>Waivework</h3>
          </div>
          { this.state.userSelected ?
            <div className="info-box box-content">
              <div> <b>Name:</b> { this.state.userSelected.firstName } { this.state.userSelected.lastName }</div>
              <div> <b>Phone:</b> { this.state.userSelected.phone } </div>
              <div> <b>Email:</b> <a href={'mailto:' + this.state.userSelected.email }>{ this.state.userSelected.email }</a> </div>
              <div> <b>Priority:</b> { this.state.userSelected.priority } </div>
              <span>
                <div> <b>Notes:</b> { JSON.parse(this.state.userSelected.notes).map((note, i) => {
                  return (
                    <div key={i}>{note}</div>
                  );
                }) } </div>
                <textarea value={this.state.noteValue} onChange={(e) => this.setState({noteValue: e.target.value})}/><br/>
                <button  className='btn btn-primary' style={{ cursor: 'pointer' }} onClick={ this.addNote.bind(this) }>
                  Add Note
                </button>
              </span>
              <a  style={{ cursor: 'pointer', marginLeft: '30px' }} onClick={ this.letinbyid.bind(this, this.state.userSelected.id) }> Let In </a>
            </div> : ''
          }
          <div className="box-content">
            <input 
              type="text" 
              className="box-table-search" 
              ref={(input) => { this.textInput = input; }}
              placeholder="Enter search text [name, email]" 
              onChange={ (e) => { this.table.search(false, this.textInput.value, this.textInput) }  } />
            <div id="isMobile" className="hidden-sm-down"></div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="name"     value="Name"     ctx={ this } />
                  <ThSort sort="location" value="Location" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="hours"    value="Hours" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="days"     value="Days" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="experience"    value="Experience" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="date"     value="Date"     ctx={ this } className="hidden-sm-down"/>
                  <th></th> 
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
