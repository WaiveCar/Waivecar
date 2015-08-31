'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import { Grid } from 'reach-components';
import { Link } from 'react-router';
import UI       from '../ui';

let Relay = Reach.Relay;

export default function (view, fields, resource) {

  // ### Create Menus
  // If menus are provided we tell the UI to handle menu construction.

  if (view.menus) {
    UI.addMenus(view.route, view.menus);
  }

  /**
   * @class ListView
   */
  class ListView extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      Relay.subscribe(this, resource.name);
    }

    /**
     * @method componentDidMount
     */
    componentDidMount() {
      if (resource.index) {
        Reach.API.get(resource.index.uri, function (err, list) {
          if (err) {
            return console.log(err);
          }
          let action            = {};
          action.type           = 'index';
          action[resource.name] = list;
          Relay.dispatch(resource.name, action);
        }.bind(this));
      } else {
        console.log('Admin Error > "%s" is missing list resource', view.name);
      }
    }

    /**
     * @method componentWillUnmount
     */
    componentWillUnmount() {
      console.log('unsubscribe %s', resource.name);
      Relay.unsubscribe(this, resource.name);
    }

    /**
     * @method render
     */
    render() {
      let columns = view.fields.map(function(field, i) {
        return field;
      });

      let columnHeadings = view.fields.map(function(field) {
        return {
          columnName  : field,
          displayName : fields[field] ? fields[field].label : field
        };
      }.bind(this));

      columns.push('actions');
      columnHeadings.push({
        name            : 'id',
        columnName      : 'actions',
        displayName     : 'Actions',
        locked          : true,
        visible         : true,
        customComponent : React.createClass({
          render : function() {
            return (
              <Link className="btn btn-icon command-edit" to={ '/admin' + view.route + '/' + this.props.rowData.id }>
                <i className="material-icons" role="edit">edit</i>
              </Link>
            );
          }
        })
      });

      return (
        <div className="container">
          { view.actions.create &&
            <Link className="btn btn-icon btn-primary command-primary-action" to={ '/admin' + view.route + '/create' }>
              <i className="material-icons" role="edit">add</i>
            </Link>
          }
          <div className="header">
            <h2>{ view.name }</h2>
          </div>
          <section className="card card-body-table">
            <div className="card-body">
              <Grid
                useGriddleStyles = { false }
                resultsPerPage   = { 25 }
                results          = { this.state[resource.name] }
                showFilter       = { true }
                showSettings     = { true }
                columns          = { columns }
                columnMetadata   = { columnHeadings }
              />
            </div>
          </section>
        </div>
      );
    }

  }

  return ListView;

};