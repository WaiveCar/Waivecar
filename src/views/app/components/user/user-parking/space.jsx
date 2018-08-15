import React, {Component} from 'react';
import Switch from 'react-toolbox/lib/switch';

export default class Space extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: this.props.space.notes,
    };
  }

  render = () => {
    let {
      space,
      toggleSpace,
      deleteSpace,
      updateSpace,
      removeCar,
      admin,
    } = this.props;
    let {notes} = this.state;
    return (
      <div className="parking-space">
        <div className="row">
          <div className="col-md-6 col-xs-12">
            <div>Address: {space.location.address}</div>
          </div>
          <div className="col-md-6 col-xs-12">
            <Switch
              className="space-switch"
              style={{fontSize: '1rem'}}
              checked={!space.ownerOccupied}
              label={
                space.ownerOccupied ? 'Space occupied' : 'Space reservable'
              }
              onChange={() => toggleSpace(space.id, 'ownerOccupied')}
            />
          </div>
        </div>
        {space.reservation && (
          <div className="parking-reservation-info">
            Space currently reserved{' '}
            {admin && (
              <span>
                by{' '}
                <a href={`/users/${space.reservedBy.id}`}>{`${
                  space.reservedBy.firstName
                } ${space.reservedBy.lastName}`}</a>
              </span>
            )}
          </div>
        )}
        {space.car && (
          <div className="parking-reservation-info">
            {admin ? (
              <span>
                <a href={`/cars/${space.car.id}`}>{`${space.car.license}`}</a>{' '}
                currently parked here.
                <button
                  className="btn btn-danger btn-wave"
                  onClick={() => removeCar(space.car.id)}>
                  Remove Car
                </button>
              </span>
            ) : (
              <span>{space.car.license} currently parked here.</span>
            )}{' '}
          </div>
        )}
        <input
          className="space-note"
          defaultValue={space.notes ? space.notes : 'Enter a note'}
          onChange={e => this.setState({notes: e.target.value})}
        />
        <div className="text-center" style={{margin: '1rem 0'}}>
          <div className="btn-group" role="group">
            <button
              className="btn btn-primary btn-wave"
              onClick={() => updateSpace(space.id, {notes})}>
              Update Note
            </button>
            <button
              className="btn btn-danger btn-wave"
              onClick={() => deleteSpace(space.id)}>
              Delete Space
            </button>
          </div>
        </div>
      </div>
    );
  };
}
