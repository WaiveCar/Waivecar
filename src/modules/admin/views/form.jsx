'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import { Form } from 'reach-components';
import UI       from '../ui';

export default function (view, fields, resource) {

  // ### Create Menus
  // If menus are provided we tell the UI to handle menu construction.

  if (view.menus) {
    // UI.addMenus(view.route, view.menus);
  }

  /**
   * @class FormView
   */
  class FormView extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.componentLoad = this.componentLoad.bind(this);
      this.state = {
        ready : false
      };
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      this.componentLoad(this.props.params.id);
    }

    /**
     * @method componentWillReceiveProps
     */
    componentWillReceiveProps(next, state) {
      let prevId = this.props.params.id;
      let nextId = next.params.id;
      if (this.state.key === undefined) {
        console.log('Rendering form: %s', nextId);
        this.componentLoad(nextId);
      }
      if (prevId !== nextId) {
        console.log('Re-rendering form: %s', nextId);
        this.componentLoad(nextId);
      }
    }

    /**
     * @method componentLoad
     * @param  {Mixed} id
     */
    componentLoad(id) {
      this.state.key = id;
      if (view.actions.create) {
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
     * @method getFields
     * @return {Array}
     */
    getFields() {
      let result = [];
      view.fields.forEach(function (value) {
        if (fields[value]) {
          let field = fields[value];
          field.name = value;
          result.push(field);
        }
      });
      return result;
    }

    /**
     * Render the record form.
     * @method render
     */
    render() {
      if (!this.state.ready) {
        return <div className="container">Loading...</div>
      }
      return (
        <div className="container">
          <div className="header">
            <h2>Form</h2>
          </div>
          <section className="card">
            <div className="card-body">
              <Form
                key    = { this.state.id }
                method = { this.state.method }
                action = { this.state.action }
                fields = { this.getFields() }
                record = { this.state.record }
              />
            </div>
          </section>

          <div className="header">
            <h2>View</h2>
          </div>
          <section className="card">
            <div className="card-body">
              <pre>
                { JSON.stringify(view, null, 2) }
              </pre>
            </div>
          </section>

          <div className="header">
            <h2>Fields</h2>
          </div>
          <section className="card">
            <div className="card-body">
              <pre>
                { JSON.stringify(fields, null, 2) }
              </pre>
            </div>
          </section>

          <div className="header">
            <h2>Resource</h2>
          </div>
          <section className="card">
            <div className="card-body">
              <pre>
                { JSON.stringify(resource, null, 2) }
              </pre>
            </div>
          </section>
        </div>
      );
    }
  }

  return FormView;

}