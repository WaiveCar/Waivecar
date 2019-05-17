import React, {Component} from 'react';

let types = ['left', 'right', 'front', 'rear', 'other'];

class UploadDamage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choosingDamage: false,
    };
    types.forEach(type => (this[type] = null));
  }

  render() {
    let {choosingDamage} = this.state;
    return (
      <div style={{marginTop: '1rem'}}>
        <div className="row">
          <button
            className="btn btn-primary btn-sm col-xs-6"
            onClick={() =>
              this.setState(state => ({choosingDamage: !state.choosingDamage}))
            }>
            {choosingDamage ? 'Hide Photo Selector' : 'Show Photo Selector'}
          </button>
        </div>
        {choosingDamage && (
          <div className="row" style={{marginTop: '0.5rem'}}>
            <h4>Damage Image Uploads</h4>
            <div className="row" style={{marginTop: '0.5rem'}}>
              <div
                className="row"
                style={{display: 'flex', justifyContent: 'space-between'}}>
                {types.map((type, i) => (
                  <div key={i}>
                    <input
                      type="file"
                      id={`new${type}File`}
                      accept="image/jpeg"
                      ref={ref => (this[type] = ref)}
                      onInput={() => this.upload(type)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default UploadDamage;
