
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

let formFields = {
  photo : [],
  car   : fields.mergeFromLayout('cars', [
    [
      { name : 'license', className : 'col-md-4 bento-form-input' },
      { name : 'id',      className : 'col-md-4 bento-form-input' },
      { name : 'vin',     className : 'col-md-4 bento-form-input' },
    ],
    [
      { name : 'make',         className : 'col-md-4 bento-form-input' },
      { name : 'model',        className : 'col-md-4 bento-form-input' },
      { name : 'manufacturer', className : 'col-md-4 bento-form-input' }
    ],
    [
      { name : 'plateNumber',  className : 'col-md-4 bento-form-input' }
    ]
  ]),

};

@mixin.decorate(History)
class CarsShowView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      carPath : null
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
    this.service.setCar(this.id());
    api.get(`/cars/${ this.id() }/bookings/?limit=1/?status=completed`, (err, bookings) => {
      this.setState({
        latestBooking: bookings[0]
      }, () => {
        api.get(`/bookings/${ bookings[0].id }/parkingDetails`, (err, response) => {
          if (response) {
            this.setState({ parkingDetails: response.details });
          }
        });
      });
    });
    api.get(`/history/car/${ this.id() }`, (err, model) => {
      this.setState({
        carPath : model.data.data
      });
    });
    api.get(`/reports/car/${ this.id() }`, (err, model) => {
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
    return this.props.params && this.props.params.id || 'create';
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
        <h3>Most Recent Parking Location</h3>
        <div className="box-content">
          {this.state.parkingDetails ? ( 
            <div>
              <div className="row">
              <h4 className="text-center">
                Parked at {moment(parkingDetails.createdAt).format('MMMM Do YYYY, h:mm a')} in a {parkingDetails.streetHours} hour parking zone
              </h4>
                <div className="image-center-container">
                  <div className="col-md-6 gallery-image">
                    <img src={`https://s3.amazonaws.com/waivecar-prod/${parkingDetails.path}`} />
                  </div>
                </div>
              </div>
            </div>) : (
            <div>
              No Parking Details Available
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
                    <span className="pull-right">{ car.totalMileage }</span>
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

  renderCarActions(car) {
    if (this.service.getState('isLoading')) {
      return (
        <div className="box">
          <h3>
            Controls for { car.license }
          </h3>
          <div className="box-content">
            <div className="loading-panel">
              <div className="sk-cube-grid">
                <div className="sk-cube sk-cube1"></div>
                <div className="sk-cube sk-cube2"></div>
                <div className="sk-cube sk-cube3"></div>
                <div className="sk-cube sk-cube4"></div>
                <div className="sk-cube sk-cube5"></div>
                <div className="sk-cube sk-cube6"></div>
                <div className="sk-cube sk-cube7"></div>
                <div className="sk-cube sk-cube8"></div>
                <div className="sk-cube sk-cube9"></div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    let switches = [
      {
        ref : 1,
        checked  : car.isLocked,
        label    : car.isLocked ? 'Unlock Doors' : 'Lock Doors',
        onChange : this.service.executeCommand.bind(this, car, car.isLocked ? 'unlock' : 'lock')
      },
      {
        ref : 2,
        checked  : car.inRepair,
        label    : car.inRepair ? 'Put in Service' : 'Make Repair',
        onChange : this.toggleService.bind(this, car)
      },
      {
        ref : 3,
        checked  : car.isImmobilized,
        label    : car.isImmobilized ? 'Deactivate Immobilizer' : 'Activate Immobilizer',
        onChange : this.service.executeCommand.bind(this, car, car.isImmobilized ? 'unlock-immobilizer' : 'lock-immobilizer')
      },
      {
        ref : 4,
        checked  : car.isAvailable,
        label    : car.isAvailable ? 'Make Unavailable' : 'Make Available',
        onChange : this.toggleAvailable.bind(this, car)
      },
      {
        ref : 5,
        label    : 'Refresh Cloudboxx Data',
        onChange : this.service.executeCommand.bind(this, car, 'refresh')
      }
    ];
    return (
      <div className="box">
        <h3>
          Controls for { car.license }
        </h3>
        <div className="box-content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-6">
                <Switch { ...switches[0] } />
              </div>
              <div className="col-md-6">
                <Switch { ...switches[1] } />
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <Switch { ...switches[2] } />
              </div>
              <div className="col-md-6">
                <Switch { ...switches[3] } />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col-md-6">
                {
                  (car.booking && car.user) ?
                    <div>
                      <a style={{ marginRight: "10px" }} href={ `/users/${ car.userId }` }>{ car.user.firstName + " " + car.user.lastName }</a>
                      Booking #<a href={ `/bookings/${ car.booking.id }` }>{ car.booking.id }</a> 
                    </div>
                  : <div className="col-md-12"> 
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
                  key       = { switches[4].ref }
                  className = { 'btn btn-primary-outline' }
                  type      = { 'button' }
                  value     = { switches[4].label }
                  onClick   = { switches[4].onChange }
                />
                Updated: { car.lastUpdated }
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
    if(car.groupCar && car.groupCar[0]) {
      currentGroupRoleId = car.groupCar[0].groupRoleId;
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

  deleteImage(row, index) {
    row.files = row.files.filter((row) => { return row.id != index; });

    api.delete('/reports/' + index, (err, user) => {
      return snackbar.notify({
        type    : 'success',
        message : 'Image deleted'
      });
    });

    this.forceUpdate();
  }

  renderImages(row) {
    let ix = 0;
    let res = row.files.map((file) => {
      return (
        <div className="col-md-4 gallery-image">
          <div className="btn-container">
            <button className='btn-link remove-image' onClick={ this.deleteImage.bind(this, row, file.id) }><i className="material-icons" role="true">close</i></button>
          </div>
          <img key={ ix++ } src={ "https://api.waivecar.com/file/" + file.fileId } />
        </div>
      );
    });
    return <div className="row">{ res }</div>;
  }

  renderDamage(car) {
    let ix = 0;
    let toShow = this.state.damage.filter((row) => { return row.files.length });
    let res = toShow.map((row) => {
      return (
        <div key={ ix ++ } className='damage-row'>
          <div className="row">
            <div className="col-xs-12">
              { moment(row.created_at).format('YYYY-MM-DD HH:mm:ss') } <a href={ "/bookings/" + row.bookingId }>#{ row.bookingId }</a>
            </div>
          </div>
          <div className="row">
             <div className="col-md-11">
                { row.description }
             </div>
          </div>
          { this.renderImages(row) }
        </div> 
      );
    });
    return (
      <div className="box">
        <h3>Damage and uncleanliness</h3>
        <div className="box-content">
        { res }
        </div>
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
        { this.renderParkingLocation(car) }
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
