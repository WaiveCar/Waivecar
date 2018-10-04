import React          from 'react';
import mixin          from 'react-mixin';
import { History }    from 'react-router';
import { relay, api } from 'bento';
import { GMap }       from 'bento-web';
import components     from '../lib/components';
import fields         from '../lib/fields';
import resources      from '../lib/resources';

@mixin.decorate(History)

class UIMap extends React.Component {

  /**
   * Sets up relay for the provided resrouce.
   * @param  {...Mixed} args
   */
  constructor(...args) {
    super(...args);
    relay.subscribe(this, this.props.resource);
  }

  /**
   * Prepare resource and update the relay.
   */
  componentDidMount() {
    let target   = this.props.resource;
    let resource = resources.get(target);
    if (this.id() === 'index' && resource && resource.index) {
      api.get(resource.index.uri, function(err, data) {
        if (err) {
          return console.log(err);
        }
        this[target].index(data);
      }.bind(this));
    } else {
      api.get(resource.show.uri.replace(':id', this.id()), function(error, data) {
        if (error) {
          throw new Error(error);
        }
        this.setState({
          default : data
        });
      }.bind(this));
    }
  }

  /**
   * @method id
   * @return {String}
   */
  id() {
    return this.props.params && this.props.params.id || 'index';
  }

  /**
   * Remove any event listeners from the relay within the component context.
   */
  componentWillUnmount() {
    relay.unsubscribe(this, this.props.resource);
  }

  /**
   * Renders the UI map.
   * @return {Object}
   */
  render() {
    let markers = this.state.default ? [ this.state.default ] : this.state[this.props.resource];
    let handler = this.props.handler ? this.props.handler : (data) => {
      this.history.pushState(null, `/${ this.props.resource }/${ data.id }`);
    }.bind(this);

    if (!markers.length) {
      return (
        <div className="map-dynamic">
          <div className="map-wrapper animated fadeIn">
            <div className="map-container map-placeholder">
              <p className="lead text-center">No { this.props.resource } are currently recorded in the WaiveCar database.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="map-dynamic">
        <GMap
          markers          = { markers }
          includeUser      = { this.props.includeUser }
          markerHandlerKey = { this.props.key }
          markerIcon       = { '/images/map/active-waivecar.svg' }
          markerHandler    = { handler }
        />
      </div>
    );
  }

}

// ### Register Component

module.exports = {
  build : () => {
    return {
      name    : 'Map',
      type    : 'map',
      order   : 6,
      class   : UIMap,
      icon    : 'map',
      options : [
        {
          label     : 'Resource',
          component : 'select',
          name      : 'resource',
          options   : resources.getSelectList(),
          helpText : 'Select resource for this Map',
          required  : true
        },
        {
          label     : 'Key',
          component : 'select',
          name      : 'key',
          helpText  : 'Select resource field to be used as selection key',
          options   : {
            connector : 'resource',
            values    : fields.getSelectList()
          },
          required  : true
        },
        {
          label     : 'Include User',
          component : 'checkbox',
          name      : 'includeUser',
          helpText  : 'Indicate if user location should be shown',
          required  : false
        }
      ]
    };
  }
}