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
    this.state = {
      search : null,
      sort : {
        key   : null,
        order : 'DESC'
      },
      more   : false,
      offset : 0,
      noteValue: null,
      currentNotes: [],
      selectedStatus: 'pending',
    };
    this.table = new Table(this, 'waitlist', null, '/waitlist?type=waivework');
    relay.subscribe(this, 'waitlist');
  }

  componentDidMount() {
    this.table.init({status: 'pending'});
    dom.setTitle('Waivework Signups');
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

  letinbyid(id, status) {
    let {perWeek, perMonth, priority, quoteExpiration} = this.state;
    if (!perWeek || !perMonth || !priority || !quoteExpiration) {
      return snackbar.notify({
        type    : 'danger',
        message : 'Please enter a weekly payment, an insurance quote amount, a priority and quote expiration date',
      });
    }
    this.letinreal({idList: [id], perMonth, perWeek, quoteExpiration, priority, status});
  }
  /* Not currently used
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
  */

  isMobile() {
    return window.getComputedStyle(document.getElementById('isMobile')).display === 'none';
  }

  priority(id, direction, waitlist) {
    api.post('/waitlist/prioritize', { id: id, direction: direction }, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      this.table.init();
      return snackbar.notify({
        type    : 'success',
        message : `${waitlist.firstName} ${waitlist.lastName} priority level ${direction === Math.abs(direction) ? 'increased' : 'decreased'}`
      });
    }); 
  }

  moreinfo(id) {
    this.setState({
      userSelected: this.table.data.filter((row) => { 
        return row.id === id;
      })[0]
    }, () => {
      this.table.init()
      this.setState({
        currentNotes: JSON.parse(this.state.userSelected.notes)
      }, () => this.table.init());
    });
  }

  row(waitlist) {
    return (
      <tr key={ waitlist.id }>
        <td>{ waitlist.firstName } { waitlist.lastName }</td>
        <td className="hidden-sm-down">{ waitlist.placeName }</td> 
        <td className="hidden-sm-down">{ waitlist.status}</td> 
        <td className="hidden-sm-down">{ waitlist.insuranceQuotes[0] ? (waitlist.insuranceQuotes[0].amount / 100).toFixed(2) : 0 }</td> 
        <td className="hidden-sm-down">{ moment(waitlist.createdAt).format('YYYY-MM-DD HH:mm:ss') }</td> 
        <td>
          <a style={{ cursor: 'pointer' }} onClick={() => this.moreinfo(waitlist.id)}>
            More Info 
          </a>
        </td>
      </tr>
    );
  }

  addNote() {
    api.post('/waitlist/addNote', { id: this.state.userSelected.id, note: this.state.noteValue }, (err, response) => {
      let temp = this.state.currentNotes ? [...this.state.currentNotes, this.state.noteValue] : [this.state.noteValue];
      this.setState({
        noteValue: '',
        currentNotes: temp,
      });
    });
  }

  deleteNote(note) {
    api.post('/waitlist/deleteNote', { id: this.state.userSelected.id, note: note }, (err, response) => {
      let temp = [...this.state.currentNotes];
      temp.splice(temp.indexOf(note), 1);
      this.setState({currentNotes: temp});
    });
  }

  changeStatus(status) {
    this.setState({selectedStatus: status}, () => this.table.search(false, this.textInput.value || ' ', this.textInput, {status: status}));
  }

  render() {
    let {userSelected, selectedStatus} = this.state;
    return (
      <div id="waitlist-list" className="container">
        <div className="box full">
          <div className='col-md-12'>
            <h3>WaiveWork Signups</h3>
          </div>
          { userSelected ?
            <div className="info-box box-content">
              <div> <b>Name:</b> { userSelected.firstName } { userSelected.lastName }</div>
              <div> <b>Phone:</b> { userSelected.phone } </div>
              <div> <b>Email:</b> <a href={'mailto:' + userSelected.email }>{ userSelected.email }</a> </div>
              {/*
              <div> <b>Priority:</b> { userSelected.priority } </div>
              <button className='btn btn-primary' onClick={() => this.priority(userSelected.id, userSelected.priority > 0 ? -userSelected.priority - 1 : -1, userSelected)}>
                Deprioritize
              </button>*/}  
              <span>
                <div className="container-fluid notes"> <b>Notes:</b> { this.state.currentNotes && this.state.currentNotes.map((note, i) => {
                  return (
                    <div className="row note" key={i}>
                      {note}
                      <button className="btn-link remove-note" onClick={() => this.deleteNote(note)}>
                        <i className="material-icons" role="true">close</i>
                      </button>
                    </div>
                  );
                }) } </div>
                <textarea className="form-control" value={this.state.noteValue} onChange={(e) => this.setState({noteValue: e.target.value})}/><br/>
                <button  className='btn btn-primary' style={{ cursor: 'pointer' }} onClick={ this.addNote.bind(this) }>
                  Add Note
                </button>
              </span>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
                <div>
                  Weekly Payment: <input type="number" style={{width: '80px'}} onChange={(e) => this.setState({perWeek: e.target.value})}/>
                </div>
                <div>
                  Insurance Quote: <input type="number" style={{width: '80px'}} onChange={(e) => this.setState({perMonth: e.target.value})}/>
                </div>
                <div>
                  Priority (based on location): <input type="number" placeholder="1 - 5" style={{width: '150px'}} onChange={(e) => this.setState({priority: e.target.value})}/>
                </div>
                <div>
                  Quote Expiration: <input type="date" style={{width: '150px'}} onChange={(e) => this.setState({quoteExpiration: e.target.value})}/>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem'}}>
                <a style={{ cursor: 'pointer', marginLeft: '30px' }} onClick={ 
                  () => this.letinbyid(userSelected.id, 'accepted') 
                }> Accept</a>
                <a style={{ cursor: 'pointer', marginLeft: '30px' }} onClick={ 
                  () => this.letinbyid(userSelected.id, 'rejected') 
                }> Reject Outright</a>
                <a style={{ cursor: 'pointer', marginLeft: '30px' }} onClick={ 
                  () => this.letinbyid(userSelected.id, 'incomplete') 
                }>Incomplete Information</a>
                <a style={{ cursor: 'pointer', marginLeft: '30px' }} onClick={ 
                  () => this.letinbyid(userSelected.id, 'nonmarket') 
                }>Out of Market</a>
              </div>
            </div> : ''
          }
          <div className="box-content">
            <input 
              type="text" 
              className="box-table-search" 
              ref={(input) => { this.textInput = input; }}
              placeholder="Enter search text [name, email]" 
              onChange={ (e) => { this.table.search(false, this.textInput.value || ' ', this.textInput, {status: selectedStatus}) }  } />
            <div id="isMobile" className="hidden-sm-down"></div>
            <div className="status-options" style={{display: 'flex', justifyContent: 'space-between'}}>
              {['pending', 'rejected', 'incomplete', 'nonmarket', 'archived', 'all'].map((status, i) => 
                <div key={i}>
                  <input type="radio" value={status} name="selectCategory" onInput={() => this.changeStatus(status)} defaultChecked={selectedStatus === status}/>
                  <label htmlFor={status}>{status}</label>
                </div>
              )}
            </div>
            <table className="box-table table-striped">
              <thead>
                <tr ref="sort">
                  <ThSort sort="name"     value="Name"     ctx={ this } />
                  <ThSort sort="placeName" value="Location" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="status"    value="Status" ctx={ this } className="hidden-sm-down"/>
                  <ThSort value="Insurance Quote" ctx={ this } className="hidden-sm-down"/>
                  <ThSort sort="createdAt"     value="Date"     ctx={ this } className="hidden-sm-down"/>
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
