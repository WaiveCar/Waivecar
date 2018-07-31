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
    let {space, toggleSpace, deleteSpace, updateSpace} = this.props;
    let {notes} = this.state;
    return (
      <div>
        <div className="row">
          <div className="col-md-6 col-xs-12">
            <div>Address: {space.location.address}</div>
          </div>
          <div className="col-md-6 col-xs-12">
            <Switch
              style={{fontSize: '1rem'}}
              checked={!space.ownerOccupied}
              label={
                space.ownerOccupied
                  ? 'Make Space Available'
                  : 'Make Space Unavailable'
              }
              onChange={() => toggleSpace(space.id, 'ownerOccupied')}
            />
          </div>
        </div>
        <input
          style={{width: '100%'}}
          defaultValue={space.notes ? space.notes : 'Enter a note'}
          onChange={e => this.setState({notes: e.target.value})}
        />
        <div className="form-actions text-center">
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
