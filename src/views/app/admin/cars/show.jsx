
import React                 from 'react';
import ReactSelect from 'react-select';
import moment                from 'moment';
import mixin                 from 'react-mixin';
import { Link, History }     from 'react-router';
import Switch                from 'react-toolbox/lib/switch';
import { auth, relay, dom, api }  from 'bento';
import { fields }            from 'bento-ui';
import { Form, Button, GMap, snackbar } from 'bento-web';
import Service               from '../../lib/car-service';
import NotesList from '../components/notes/list';
import Logs from '../../components/logs';
import config from 'config';
import helpers from 'bento/lib/helpers';

const API_URI = config.api.uri + (config.api.port ? ':' + config.api.port : '');

let formFields = {
  photo : [],
  car   : fields.mergeFromLayout('cars', [
    [
      { name : 'license', className : 'col-md-4 bento-form-input' },
      { name : 'id',      className : 'col-md-4 bento-form-input' },
      { name : 'vin',     className : 'col-md-4 bento-form-input' },
    ],
    [
      { name : 'model',        className : 'col-md-3 bento-form-input' },
      { name : 'manufacturer', className : 'col-md-3 bento-form-input' },
      { name : 'plateNumber',  className : 'col-md-4 bento-form-input' },
      { name : 'plateState',  className : 'col-md-2 bento-form-input' }
    ]
  ]),

};

@mixin.decorate(History)
class CarsShowView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      carPath : null,
      damageFilter: null,
    };
    dom.setTitle('Car');
    this.service = new Service(this);
    relay.subscribe(this, 'cars');
  }

  handleChange = (item, value) => {
    const newState = {};
    newState[item] = value;
    this.setState(newState);
  }

  componentDidMount() {
    let id = this.id();
    this.service.setCar(id);
    api.get(`/cars/${ id }/bookings?limit=1&status=completed`, (err, bookings) => {
      if(bookings.length) {
        this.setState({
          latestBooking: bookings[0]
        }, () => {
          api.get(`/bookings/${ bookings[0].id }/parkingDetails`, (err, response) => {
            if (response) {
              this.setState({ parkingDetails: response.details });
            }
          });
        });
      }
    });
    api.get(`/history/car/${ id }`, (err, model) => {
      this.setState({
        carPath : model.data.data
      });
    });
    api.get(`/reports/car/${ id }?fromDate=${moment().subtract(1, 'months').utc().format()}`, (err, model) => {
      if (err) {
        console.log(err);
      }
      console.log('model: ', model);
      model.reverse();
      this.setState({
        damage : model
      });
    });

    api.get('/group', (err, groups) => {
      if(err) {
        snackbar.danger(err);
      }

      this.setState({
        groups : groups
      });

    });
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'cars');
  }

  id() {
    return this.props.params ? this.props.params.id : 'create';
  }

  renderBoolean(val) {
    if (val === true) {
      return <span className="text-success"><i className="material-icons" role="true">check</i></span>;
    }
    return <span className="text-muted"><i className="material-icons" role="true">close</i></span>;
  }

  updateUser(event) {
    this.setState({user_find_name: null, user_find_id: event.target.value});
  }

  findUser() {
    let user_id = this.state.user_find_id;
    if (parseInt(user_id) == user_id) {
      api.get(`/users/${ user_id }`, (err, user) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.setState({user_find_name: [[user_id, `${user.firstName} ${user.lastName}`]]});
      });
    } else {
      api.get(`/users?search="${ user_id }"`, (err, userList) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        this.setState({
          user_find_name: userList.map((row) => {
            return [ row.id, `${row.firstName} ${row.lastName}` ]
          })
        });
      });
    }
  }

  bookCar(user_id) {
    // Looking at the code I belive it's a POST to /bookings
    // with a userId of the driver to drive and the carId of
    //
    // Why the carId is so deeply entrenched is bs I'm not willing
    // to get into right now.
    let data = { 'source': 'web', 'userId': user_id, 'carId': this.state.car.cars[0].id };
    api.post('/bookings', data, (err, user) => {
      if(err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      // This seems to update the screen. There's probably better ways
      // but I have no idea how this rube goldberg contraption works.
      this.service.setCar(this.id());
    })
  }

  renderCarMedia(car) {
    return (
      <div className="box">
        <div className="container-fluid">
          <div className="row">
            <div className="col-xs-12">
              <div className="ride-map">
                <GMap
                  markerIcon = { '/images/map/active-waivecar.svg' }
                  markers    = {[
                    {
                      longitude : car.longitude,
                      latitude  : car.latitude,
                      type      : 'start'
                    }
                  ]}
                  path      =  {this.state.carPath }
                />
                { this.renderLocation(car) }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderParkingLocation(car) {
    let { parkingDetails } = this.state;
    return (
      <div className="box">
        <h3>Parking Info</h3>
        <div className="box-content">
          {this.state.parkingDetails ? ( 
            <div>
              <div className="row">
              <h4 className="text-center">
                {moment(parkingDetails.createdAt).format('HH:mm MMMM Do')} (Claimed: {parkingDetails.streetHours} hours) <a href={`/bookings/${this.state.latestBooking.id}`}>Booking Details</a>
              </h4>
                <div className="image-center-container">
                  <div className="col-md-6 gallery-image">
                    <img src={`${API_URI}/file/${parkingDetails.streetSignImage}`} />
                  </div>
                </div>
              </div>
            </div>) : (
            <div>
              <h4 className="text-center">
                {moment(this.state.latestBooking.details[1].createdAt).format('HH:mm MMMM Do')}. <a href={`/bookings/${this.state.latestBooking.id}`}>Booking Details</a>
              </h4>
              No Parking Image
            </div>
          )}
        </div>
      </div>
    );
  }

  renderCarForm(car) {
    return (
      <div className="box hidden-xs-down">
        <h3>Details</h3>
        <div className="box-content">
          <Form
            ref       = "car"
            className = "bento-form-static"
            fields    = { formFields.car }
            default   = { car }
            buttons   = {[
              {
                value : 'Update',
                type  : 'submit',
                class : 'btn btn-primary btn-profile-submit'
              }
            ]}
            submit = { this.service.update }
          />
          <form role="form" onSubmit={ this.submit }>
            <div className="form-group row">
              <label className="col-sm-3 form-control-label" style={{ color : '#666', fontWeight : 300 }}>Tags</label>
              <div className="col-sm-9 text-right" style={{ padding : '8px 0px' }}>
                <div className="radio-inline">
                  <label>
                    <input type="checkbox" name="tagList[]" value="la" defaultChecked={ this.hasTag('la') } />
                    Regular Service
                  </label>
                </div>
                <div className="radio-inline">
                  <label>
                    <input type="checkbox" name="tagList[]" value="csula" defaultChecked={ this.hasTag('csula') } />
                    CSULA
                  </label>
                </div>
                <div className="radio-inline">
                  <label>
                    <input type="checkbox" name="tagList[]" value="level" defaultChecked={ this.hasTag('level') } />
                    Level
                  </label>
                </div>
                <div className="radio-inline">
                  <label>
                    <input type="checkbox" name="tagList[]" value="choice" defaultChecked={ this.hasTag('choice') } />
                    Choice Hotels
                  </label>
                </div>
                <div className="radio-inline">
                  <label>
                    <input type="checkbox" name="tagList[]" value="waivework" defaultChecked={ this.hasTag('waivework') } />
                    WaiveWork
                  </label>
                </div>
                <div className="form-actions text-center">
                  <div className="btn-group" role="group">
                    <button type="submit" className="btn btn-sm">Update Tags</button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  renderCarIndicators(car) {
    return (
      <div className="box">
        <h3>
          Diagnostics
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group">
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isKeySecure) }</span>
                    Key Secure
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isChargeCardSecure) }</span>
                    Charge Card Secure
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isLocked) }</span>
                    Locked
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isIgnitionOn) }</span>
                    Ignition
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isImmobilized) }</span>
                    Immobilized
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isAvailable) }</span>
                    Available
                    { !car.isAvailable && <span className="user-link">&nbsp;<em>allocated to { car.user ? `${ car.user.firstName } ${ car.user.lastName }` : `user ${ car.userId }` }</em></span> }
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.inService) }</span>
                    In Service
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ Math.round(0.621371 * car.totalMileage)  }</span>
                    Total Miles
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-group">
                  <li className="list-group-item">
                    <span className="pull-right">{ car.currentSpeed }</span>
                    Current Speed
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.charge }</span>
                    Charge Level
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.range }</span>
                    Range
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isCharging) }</span>
                    Charging
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isQuickCharging) }</span>
                    Quick Charging
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ this.renderBoolean(car.isOnChargeAdapter) }</span>
                    On Charge Adapter
                  </li>
                  <li className="list-group-item">
                    <span className="pull-right">{ car.boardVoltage }</span>
                    CloudBoxx Voltage
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  toggleAvailable(car) {
    if (car.isAvailable) {
      this.service.executeCommand(car, 'unavailable');
    } else {
      if (car.booking) {
        snackbar.notify({
          type    : 'danger',
          message : 'Car is in active rental.'
        });
      } else {
        this.service.executeCommand(car, 'available');
      }
    }
  }

  toggleHidden(car) {
    if (car.adminOnly) {
      this.service.executeCommand(car, 'visible');
    } else {
      if (car.booking) {
        snackbar.notify({
          type    : 'danger',
          message : 'Car is in active rental. Hide from app anyway?',
          action : {
            title : 'CONTINUE',
            click : () => {
              snackbar.dismiss();
              this.service.executeCommand(car, 'hidden');
            }
          }
        });
      } else {
        this.service.executeCommand(car, 'hidden');
      }
    }
  }

  toggleService(car) {
    if (car.adminOnly) {
      this.service.executeCommand(car, 'service');
    } else {
      if (car.booking) {
        snackbar.notify({
          type    : 'danger',
          message : 'Car is in active rental. Set repair anyway?',
          action : {
            title : 'CONTINUE',
            click : () => {
              snackbar.dismiss();
              this.service.executeCommand(car, 'repair');
            }
          }
        });
      } else {
        this.service.executeCommand(car, 'repair');
      }
    }
  }

  renderUserSearch(car) {
    if(!this.state.user_find_name) {
      return '';
    }
    return this.state.user_find_name.map((row) => {
      let user_id = row[0], user_name = row[1];

      return (
        <div className='row'>
          <div style={{ padding: "10px 0" }} className="col-xs-6"><a target='_blank' href={ `/users/${ user_id }` }>#{user_id}</a> { user_name }</div>
          <button className="btn btn-link col-xs-6" onClick={ this.bookCar.bind(this, user_id) }>Book { car.license }</button>
        </div>
      )
    });
  }

  hasTag = (tag) => {
    return this.state.car.cars[0].tagList.filter(item => item.groupRole.name === tag).length > 0;
  }

  submit = (event) => {
    let form = new helpers.Form(event);
    api.put(`/cars/${ this.state.car.cars[0].id }`, form.data, (err) => {
      if (err) {
        return snackbar.notify({
          type    : 'danger',
          message : err.message
        });
      }
      snackbar.notify({
        type    : 'success',
        message : 'Car details successfully updated'
      });
    });
    event.preventDefault();
  }

  renderCarActions(car) {
    let switches = [
      {
        ref : 1,
        label    : 'Unlock',
        onChange : this.service.executeCommand.bind(this, car, 'unlock-doors')
      },
      {
        ref: 2,
        label    : 'Lock',
        onChange : this.service.executeCommand.bind(this, car, 'lock-doors')
      },
      {
        ref : 3,
        checked  : car.inRepair,
        label    : car.inRepair ? 'Put in Service' : 'Make Repair',
        onChange : this.toggleService.bind(this, car)
      },
      {
        ref : 4,
        checked  : car.isImmobilized,
        label    : car.isImmobilized ? 'Deactivate Immobilizer' : 'Activate Immobilizer',
        onChange : this.service.executeCommand.bind(this, car, car.isImmobilized ? 'unlock-immobilizer' : 'lock-immobilizer')
      },
      {
        ref : 5,
        checked  : car.isAvailable,
        label    : car.isAvailable ? 'Make Unavailable' : 'Make Available',
        onChange : this.toggleAvailable.bind(this, car)
      },
      {
        ref : 6,
        label    : 'Refresh Cloudboxx Data',
        onChange : this.service.executeCommand.bind(this, car, 'refresh')
      }
    ];
    let isLocked = this.state.car.cars[0].isLocked, css = 'btn-gray';
    return (
      <div className="box">
        <h3>
          Controls for { car.license }
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6 col-xs-12">
                <Button
                  key       = { switches[0].ref }
                  className = { 'btn btn-sm col-xs-6 ' + (isLocked ? css : 'btn-link') }
                  type      = { 'button' }
                  value     = { switches[0].label }
                  onClick   = { switches[0].onChange }
                />
                <Button
                  key       = { switches[1].ref }
                  className = { 'btn btn-sm col-xs-6 ' + (!isLocked ? css : 'btn-link') }
                  type      = { 'button' }
                  value     = { switches[1].label }
                  onClick   = { switches[1].onChange }
                />
              </div>
              <div className="col-md-6 col-xs-12">
                <Switch { ...switches[2] } />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Switch { ...switches[3] } />
              </div>
              <div className="col-md-6">
                <Switch { ...switches[4] } />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col-md-6">
                {
                  car.user ?
                    <div>
                      <a style={{ marginRight: "10px" }} href={ `/users/${ car.userId }` }>{ car.user.firstName + " " + car.user.lastName }</a>
                      { 
                        car.booking ?
                          <span>Booking #<a href={ `/bookings/${ car.booking.id }` }>{ car.booking.id }</a></span> :
                          <span>No booking. <a href="#" onClick={ this.service.executeCommand.bind(this,car,'kick')}>Kick user out</a></span>
                      }
                    </div>
                  : <div>
                      <div className="row" style={{ marginTop: "4px" }}>
                        <input 
                          onChange={ this.updateUser.bind(this) }
                          value={ this.state.user_find_id } 
                          style={{ marginTop: "1px", padding: "2px", height: '40px' }} 
                          className="col-xs-6" 
                          placeholder="Name or ID" 
                        />
                        <button className="btn btn-primary btn-sm col-xs-6" onClick={ this.findUser.bind(this) }>Find User</button>
                      </div>
                      <div className={ `row ${ this.state.user_find_name ? '' : 'hide' }` }>
                        { this.renderUserSearch(car) }
                      </div>
                    </div>
                }
              </div>
              <div className="col-md-6">
                <Button
                  key       = { switches[5].ref }
                  className = { 'btn btn-primary-outline' }
                  type      = { 'button' }
                  value     = { switches[5].label }
                  onClick   = { switches[5].onChange }
                />
                Updated: { this.service.getState('isLoading') ?  
                  <img src="../images/site/spinner.gif" /> : (car.lastUpdated ? car.lastUpdated : this.service.getState('updatedAt')) 
                }
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <div className="p-t">
                  <small className="text-danger hidden-xs-down">WARNING: These actions may remotely access and control the car</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCarGroup(car) {
    return (<div />);

    var options = this.state.groups ? 
    this.state.groups.map(x => {
      return {value: x.id, label: x.name } 
    }) : [ {value: '', label: ''}];

    var currentGroupRoleId = '';
    if(car.tagList && car.tagList[0]) {
      currentGroupRoleId = car.tagList[0].groupRoleId;
    }

    return (
      <div className="box">
        <h3>
          Group of { car.license }
        </h3>
        <div className={ 'box-content' }>
          <div className={'row'}>
            <label>{ 'Group' }</label>
            <ReactSelect
              name        = { 'cargroup' }
              value       = { currentGroupRoleId || ''}
              options     = { options }
              onChange    = { this.service.updateCarGroup.bind(this.service, car) }
              placeholder = { 'Choose car group' }
            />
          </div>
          <div className={'row'}></div>
        </div>
      </div>
    );
  }

  renderDamage(car) {
    return (
      <div className="box">
        <h3>Damage and uncleanliness</h3>
        <div className="box-content">
          <div>
            {this.state.damage && this.state.damage.map((row, i) =>
              <div key={i}>
                {this.renderBookingDamage(row)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  renderBookingDamage(booking) {
    let bookingList = booking.reports;
    let { damageFilter } = this.state;
    let { details } = booking;
    let rowsToRender = [];
    if (!damageFilter && bookingList.length >=8) {
      let other = bookingList.filter(item => item.type === 'other');
      let angles = bookingList.filter(item => item.type !== 'other');
      rowsToRender = [angles.slice(0, 4), angles.slice(4), other];
    } else {
      rowsToRender = [bookingList];
    }
    let bookingStart = details[0] && moment(details[0].created_at);
    let bookingMiddle = details[0] && details[1] && moment(details[1].created_at).diff(moment(details[0].created_at)) / 2;
    return (
      <div className="dmg-group">
        {bookingStart &&
          <div>
              Booking Start: 
              <a className='damage-booking-link' href={ '/bookings/' + booking.id } target="_blank">
                {bookingStart.format('MMMM DD YYYY hh:mm:ss A')}
              </a>
            </div>
        }
        {(rowsToRender[0] && rowsToRender[0].length) &&
          <div>
            {rowsToRender.map((row, i) => {
              return (
                <div>
                  {row.length && 
                      <div className={bookingMiddle && (moment(row[0].created_at).diff(bookingStart) < bookingMiddle ? 'before-middle' : 'after-middle')}>
                      {`+ ${moment.utc(moment(row[0].created_at).diff(bookingStart)).format('H:mm:ss')}`} 
                    </div>
                  }
                  <div key={i} className="dmg-row">
                    {row.map((image, j) =>  { 
                      return image && image.file && ( 
                        <div className="damage-image-holder">
                          <a href={`${API_URI}/file/${image.file.id}` } target="_blank" key={j}>
                            <img className="damage-image" src={`${API_URI}/file/${image.file.id}`} />
                          </a>
                        </div>);
                      }
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        }
        {
          details[1] && 
            <div>
              Booking End: 
              <div>+ {moment.utc(moment(details[1].created_at).diff(bookingStart)).format('H:mm:ss')}</div>
              <div>{moment(details[1].created_at).format('MMMM DD YYYY hh:mm:ss A')}</div>
            </div>
        }
      </div>
    );
  }

  renderLocation(car) {
    let geo = car.latitude + ',' + car.longitude;
    if(this.state.location) {}

    if(this.map && this.map.getAddress) {
    }

    return (
      <div className="text-center">
        <a target="_blank" className="btn btn-link btn-sm col-xs-6" style={{ float: "none" }} href={ "http://maps.google.com/?q=" + geo + '(' + car.license + ')' }>Open in Maps</a>

      </div>
    );
  }

  renderLastUpdate(car) {
    let updated = moment(car.updatedAt).format('h:mm.ss YY-MM-DD');

    return (
      <div className="pull-right">
        <span><em>updated { updated }</em></span>
      </div>
    );
  }

  render() {
    let car = this.service.getState('cars').find(c => c.id === this.id());

    if (!car || !car.id) {
      return <div className="text-center">Retrieving Car...</div>
    }
    dom.setTitle(car.license);

    return (
      <div className="cars cars-show">
        { this.renderCarGroup(car) }
        { this.renderCarActions(car) }
        { this.renderCarMedia(car) }
        { this.state.latestBooking && this.renderParkingLocation(car) }
        { this.renderCarIndicators(car) }
        { this.renderCarForm(car) }
        <NotesList type='car' identifier={ car.id }></NotesList>
        <Logs carId={ car.id } />
        { this.renderDamage(car) }
      </div>
    );
  }

}

module.exports = CarsShowView;
