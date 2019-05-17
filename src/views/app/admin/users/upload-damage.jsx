import React, {Component} from 'react';

let types = ['left', 'right', 'front', 'rear', 'other'];

class UploadDamage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choosingDamage: false,
    };
    types.forEach(type => {
      this[type] = null;
      this.state[`${type}File`] = null;
    });
  }

  upload(type) {
    console.log('uploading', type);
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
                    <button className="btn btn-primary btn-sm col-xs-12">
                      <label
                        htmlFor={`${type}File`}
                        style={{
                          width: '100%',
                          height: '100%',
                          marginBottom: 0,
                          cursor: 'pointer',
                        }}>
                        {type}
                      </label>
                      <input
                        style={{
                          opacity: 0,
                          overflow: 'hidden',
                          position: 'absolute',
                          top: '50%',
                          right: '50%',
                          zIndex: -1,
                        }}
                        type="file"
                        id={`${type}File`}
                        accept="image/jpeg"
                        ref={ref => (this[type] = ref)}
                        onInput={() => this.upload(type)}
                      />
                    </button>
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
