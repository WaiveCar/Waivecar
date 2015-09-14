'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import { Grid } from 'reach-components';
import { Link } from 'react-router';
import UI       from '../ui';

let Relay = Reach.Relay;

export default function (view, fields, resource) {

  /**
   * @class ListView
   */
  class ListComponent extends React.Component {

    /**
     * @constructor
     */
    constructor(...args) {
      super(...args);
      this.tableActions = this.tableActions.bind(this);
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
      Relay.unsubscribe(this, resource.name);
    }

    /**
     * @method delete
     * @param  {Int} id
     */
    delete(id) {
      Reach.API.delete(resource.delete.uri.replace(':id', id), function (err) {
        if (err) {
          return console.log(err);
        }
      });
    }

    /**
     * @method tableActions
     * @param  {Int} id
     */
    tableActions(id) {
      let editAction = view.actions.update
        ? (
            <Link className="grid-action" to={ resource.name + '/' + id }>
              <i className="material-icons" role="edit">edit</i>
            </Link>
          )
        : null;
      let deleteAction = view.actions.delete
        ? (
            <button className="grid-action danger" onClick={ this.delete.bind(this, id) }>
              <i className="material-icons" role="delete">delete</i>
            </button>
          )
        : null;

      return (
        <div className="text-center">
          { editAction }
          { deleteAction }
        </div>
      );
    }

    /**
     * @method getHeadings
     */
    getHeadings() {
      let self     = this;
      let headings = view.fields.map(function(field) {
        return {
          columnName  : field,
          displayName : fields[field] ? fields[field].label : field
        };
      }.bind(this));

      headings.push({
        name            : 'id',
        columnName      : 'actions',
        displayName     : 'Actions',
        locked          : true,
        visible         : true,
        customComponent : React.createClass({
          render : function() {
            return self.tableActions(this.props.rowData.id);
          }
        })
      });

      return headings;
    }

    /**
     * @method getColumns
     */
    getColumns() {
      let columns = view.fields.map(function(field, i) {
        return field;
      });
      columns.push('actions');
      return columns;
    }

    /**
     * @method render
     */
    render() {
      let columnHeadings = this.getHeadings();
      let columns        = this.getColumns();
      return (
        <div id="table-component" className="component-container">
          { view.actions.create &&
            <Link className="btn btn-icon btn-primary command-primary-action" to={ resource.name + '/create' }>
              <i className="material-icons" role="edit">add</i>
            </Link>
          }
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
      );
    }

  }

  return ListComponent;

};