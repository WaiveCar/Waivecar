import { History, Link } from 'react-router';
import React from 'react';
import mixin from 'react-mixin';
import moment from 'moment';
import Table from 'bento-service/table';
import FormInput from '../components/form-input';
import { snackbar }   from 'bento-web';
import { api } from 'bento';
import { Form } from 'bento/lib/helpers';
import { relay, dom } from 'bento';
var _ = require('lodash');

@mixin.decorate(History)
class TicketIndex extends React.Component {

  constructor(...args) {
    super(...args);
    this.table = new Table(this, 'tickets', [], '/tickets');
    this.state = {
      currentTicket: false,
      newTicket : false,
      more   : false,
      offset : 0
    };
    relay.subscribe(this, 'tickets');
  }

  componentDidMount() {
    dom.setTitle("Tickets");
    this.table.init();
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'tickets');
  }
                            
  row(log) {
    return (
      <tr className={ log.status } key={ log.id } onClick={ this.showTicket.bind(this, log.id) }>
        <td className='date'>{ moment(log.updatedAt).format('MM/DD HH:mm') }</td>
        <td>{ log.action }</td>
        <td>{ log.car ? 
          <Link to={ `/cars/${ log.car.id }`}>{ log.car.license }</Link>
          : '' 
        }</td>
        <td>{ log.status }</td>
      </tr>
    );
  }

  createTicket(data) {
    let inputData = (new Form(data)).data;
    api.post(`/tickets`, inputData, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
    });
  }

  updateTicket(id, opts) {
    api.post(`/tickets/${ id }/update`, opts, (err, data) => {
      if (err) {
        return snackbar.notify({
          type    : `danger`,
          message : err.message
        });
      }
      this.setState({ currentTicket: false });
    });
  }

  showTicket(id) {
    this.setState({
      currentTicket: (this.state.tickets.filter((row) => row.id === id))[0],
      newTicket: false
    });
  }

  toggleNewTicketVisible() {
    this.setState({
      currentTicket: false,
      newTicket: !this.state.newTicket
    });
  }

  renderExistingTicketIfSet(ticket) {
    return ticket ?
      <div className="box-content">
        <div className="bento-form-static" role="form">
          <div className="form-group row">
            <FormInput className="col-md-4 bento-form-input">
              <input value={ ticket.action } readOnly type="text" name="action" className="form-control" />
            </FormInput>
            <FormInput className="col-md-4 bento-form-input">
              <input value={ ticket.car ? ticket.car.license : '' } readOnly type="text" name="car" className="form-control" />
            </FormInput>
            <FormInput className="col-md-4 text-center bento-form-input">
              { ticket.status === 'open' ?
                <button onClick={ this.updateTicket.bind(this, ticket.id, {"status": "inprogress"}) } className="btn btn-primary">Mark In Progress</button> :
                <button onClick={ this.updateTicket.bind(this, ticket.id, {"status": "closed"}) } className="btn btn-primary">Mark Closed</button>
              }
            </FormInput>
          </div>
        </div>
      </div>
    : '';
  }

  renderNewTicketIfSet(ticket){
    return ticket ?
      <div className="box-content">
        <form className="bento-form-static" role="form" onSubmit={ this.createTicket }>
          <div className="form-group row">
            <FormInput className="col-md-4 bento-form-input">
              <input type="text" name="action" className="form-control" placeholder="action (ex: pickup)" required />
            </FormInput>
            <FormInput className="col-md-4 bento-form-input">
              <input type="text" name="car" className="form-control" placeholder="car (ex: waive4)" required />
            </FormInput>
            <FormInput className="col-md-4 text-center bento-form-input">
              <button type="submit" className="btn btn-primary">Add</button>
              <button onClick={ this.toggleNewTicketVisible.bind(this) } className="btn btn-link">Cancel</button>
            </FormInput>
          </div>
        </form>
      </div>
    : '';
  }

  render() {
    return (
      <div id="tickets-list" className="container">
        { this.renderNewTicketIfSet(this.state.newTicket) }
        { this.renderExistingTicketIfSet(this.state.currentTicket) }
        <div className="box full">
          <h3>Tickets
            { this.state.newTicket ? '' :
              <button onClick={ this.toggleNewTicketVisible.bind(this) } className="btn btn-link">Add Ticket</button>
            }
          </h3>
          <div className="box-content">
            <table className="box-table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Car</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                { this.table.index() }
              </tbody>
            </table>
            { !this.state.tickets.length ? <h3 style={{ textAlign : 'center', marginTop : 20 }}><em>No tickets to display</em></h3> : '' }
            {
              this.state.more ?
                <div className="text-center" style={{ marginTop : 20 }}>
                  <button className="btn btn-primary" onClick={ this.table.more }>Load More</button>
                </div>
                :
                ''
            }
          </div>
        </div>
      </div>
    );
  }
}

module.exports = TicketIndex;
