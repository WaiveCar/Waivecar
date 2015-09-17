'use strict';

import React          from 'react';
import Reach          from 'reach-react';
import mixin          from 'react-mixin';
import { Navigation } from 'react-router';
import { Content, Snackbar }    from 'reach-components';
import UI             from '../ui';

@mixin.decorate(Navigation)

export default function (view, fields, resource) {

  /**
   * @class ContentComponent
   */
  class ContentComponent extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.componentLoad = this.componentLoad.bind(this);
      this.handleSuccess = this.handleSuccess.bind(this);
      this.handleError   = this.handleError.bind(this);
      this.state         = {
        ready : false
      };
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      this.componentLoad(this.props.id || this.props.params.id);
    }

    /**
     * @method componentWillReceiveProps
     */
    componentWillReceiveProps(nextProps, nextState) {
      let prevId = this.props.params.id;
      let nextId = nextProps.params.id;
      if (this.state.key === undefined) {
        this.componentLoad(nextId);
      }
      if (prevId !== nextId) {
        this.componentLoad(nextId);
      }
    }

    /**
     * @method componentLoad
     * @param  {Mixed} id
     */
    componentLoad(id) {
      this.state.key = id;
      if (view.actions && view.actions.create) {
        this.setState({
          ready  : true,
          id     : null,
          method : resource.store.method,
          action : resource.store.uri
        });
      } else {
        let recordUri = resource.show.uri.replace(':id', id);
        Reach.API.get(recordUri, function (err, record) {
          if (err) {
            return console.log(err);
          }
          this.setState({
            ready  : true,
            id     : id,
            method : resource.update.method,
            action : resource.update.uri.replace(':id', id),
            record : record
          });
        }.bind(this));
      }
    }

    /**
     * Executed when the form is successfully submitted.
     * @method handleSuccess
     * @param  {Object}   data
     * @param  {Function} reset
     */
    handleSuccess(data, reset) {
      if (view.actions.create) {
        this.goBack();
      } else {
        Snackbar.notify({
          type    : 'success',
          message : 'Record was successfully updated.'
        });
      }
    }

    /**
     * Executed when the form encounters an error.
     */
    handleError(data) {
      Snackbar.notify({
        type    : 'danger',
        message : data.message
      });
    }

    /**
     * @method render
     */
    render() {
      if (!this.state.ready) {
        return <div>Loading...</div>
      }
      return (
        <Content
          key       = { this.state.id }
          method    = { this.state.method }
          action    = { this.state.action }
          record    = { this.state.record }
          onSuccess = { this.handleSuccess }
          onError   = { this.handleError }
        />
      );
    }
  }

  return ContentComponent;

}