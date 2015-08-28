'use strict';

import React    from 'react';
import Reach    from 'reach-react';
import { Grid } from 'reach-components';
import { Link } from 'react-router';
import UI       from '../ui';

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

    constructor(...args) {
      super(...args);
      this.state = {
        records          : [],
        actions          : view.actions,
        fields           : view.fields,
        fieldDefinitions : fields
      };
    }

    componentDidMount() {
      if (resource.list) {
        Reach.API.get(resource.list.uri, function (err, list) {
          if (err) {
            return console.log(err);
          }
          this.setState({
            records : list
          });
        }.bind(this));
      } else {
        console.log('Admin Error > "%s" is missing list resource', view.name);
      }
    }

    render() {
      let self = this;
      let columns = self.state.fields.map(function(field, i) {
        return field;
      });
      let columnHeadings = self.state.fields.map(function(field) {
        return {
          columnName  : field,
          displayName : self.state.fieldDefinitions[field] ? self.state.fieldDefinitions[field].label : field
        };
      });

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
              <Link className="btn btn-icon command-edit" to={ view.route + '/' + this.props.rowData.id }>
                <i className="material-icons" role="edit">edit</i>
              </Link>
            );
          }
        })
      });

      return (
        <div className="container">
          { self.state.actions.create &&
            <Link className="btn btn-icon btn-primary command-primary-action" to={ view.route + '/new' }>
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
                results          = { self.state.records }
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