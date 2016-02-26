import React                from 'react';
import async                from 'async';
import { auth, api, relay } from 'bento';
import { snackbar }         from 'bento-web';

class BookingFeesView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      cartId : this.props.cartId || null,
      items  : []
    };
    relay.subscribe(this, 'carts');
  }

  /**
   * Load items and cart.
   * @return {Void}
   */
  componentDidMount() {
    async.series([
      this.loadItems,
      this.loadCart
    ], (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  /**
   * Unsubscribe from the carts relay.
   * @return {Void}
   */
  componentWillUnmount() {
    relay.unsubscribe(this, 'carts');
  }

  /**
   * Loads items from the shop.
   * @param  {Function} done
   * @return {Void}
   */
  loadItems = (done) => {
    api.get(`/shop/items`, (err, items) => {
      if (err) {
        return done(err);
      }
      this.setState({ items : items });
      done();
    });
  }

  /**
   * Loads a cart, either pre-defined or creates a new one.
   * @param  {Function} done
   * @return {Void}
   */
  loadCart = (done) => {
    if (this.state.cartId) {
      api.get(`/shop/carts/${ id }`, (err, cart) => {
        if (err) {
          return done(err);
        }
        relay.dispatch('carts', {
          type : 'store',
          data : cart
        });
        done();
      });
    } else {
      api.post('/shop/carts', {
        items : []
      }, (err, cart) => {
        if (err) {
          return done(err);
        }
        this.setState({
          cartId : cart.id
        });
        relay.dispatch('carts', {
          type : 'store',
          data : cart
        });
        done();
      });
    }
  }

  /**
   * Updates Miscellaneous item values for this cart
   * @param {String} field
   * @param {Object} evnt
   * @return none
   */
  setGeneric(field, evnt) {
    let items = this.state.items;
    let item = items.find(item => item.name === 'Miscellaneous');

    switch(field) {
      case 'description':
        item[field] = evnt.target.value;
        break;
      case 'price':
        if (!isNaN(evnt.target.value)) {
          item[field] = (+evnt.target.value) * 100;
        }
    }

    this.setState({ items });
  }

  /**
   * Returns Miscellaneous item row
   * @param {Object} cart
   * @param {Object} item
   * @return {Object}
   */
  getGeneric(cart, item) {
    return (
      <tr key={ item.id } className="fee-item-row">
        <td>
          { item.name }
          <input className='form-control' style={{ width: '90%' }} type='text'
            onChange={ this.setGeneric.bind(this, 'description') } placeholder='Enter fee description'></input>
        </td>
        <td className="hidden-xs-down" style={{ paddingTop: 24 }}>
          <input className='form-control' style={{ width: 70, marginTop: 9, paddingRight: 0 }}
            onChange={ this.setGeneric.bind(this, 'price') } type='number' placeholder='Price'></input>
        </td>
        <td className="text-center" style={{ paddingTop: 24 }}>
          <button className="fee-item-btn" onClick={ () => { this.removeItem(cart, item.id) } }>-</button>
          { item.quantity }
          <button className="fee-item-btn" onClick={ () => { this.addItem(cart, item.id) } }>+</button>
        </td>
        <td className="hidden-xs-down text-right" style={{ paddingTop: 24 }}>${ item.total / 100 }</td>
      </tr>
    );
  }

  /**
   * Returns a list of items available and current values of cart.
   * @return {Object}
   */
  getItems(cart) {
    return this.state.items.map(item => {
      let cartItem = cart.items.find(val => val.id === item.id);

      item.quantity = cartItem ? cartItem.quantity : 0;
      item.total    = cartItem ? cartItem.total    : 0;
      if (item.name === 'Miscellaneous') return this.getGeneric(cart, item);

      return (
        <tr key={ item.id } className="fee-item-row">
          <td>
            { item.name }
            <div style={{ color : '#aaa', fontSize : '.8rem' }}>{ item.description }</div>
          </td>
          <td className="hidden-xs-down">${ item.price / 100 }</td>
          <td className="text-center">
            <button className="fee-item-btn" onClick={ () => { this.removeItem(cart, item.id) } }>-</button>
            { item.quantity }
            <button className="fee-item-btn" onClick={ () => { this.addItem(cart, item.id) } }>+</button>
          </td>
          <td className="hidden-xs-down text-right">${ item.total / 100 }</td>
        </tr>
      );
    });
  }

  /**
   * Removes a item quantity from the items list.
   * @param  {Object} cart
   * @param  {Number} id   The item id.
   * @return {Void}
   */
  removeItem(cart, id) {
    let items = [];
    cart.items.forEach(item => {
      if (item.id === id) {
        item.quantity--;
        if (item.quantity >= 1) {
          items.push(item);
        }
      } else {
        items.push(item);
      }
    });
    this.updateCart(cart, items);
  }

  /**
   * Adds a item or increases item quantity by 1.
   * @param  {Object} cart
   * @param  {Number} id   The item id
   * @return {Void}
   */
  addItem(cart, id) {
    let items = [];
    let found = false;
    cart.items.forEach(item => {
      if (item.id === id) {
        item.quantity++;
        found = true;
      }
      items.push(item);
    });
    if (!found) {
      let _item = this.state.items.find(i => i.id === id);
      if (_item.name === 'Miscellaneous') {
        items.push({
          id : id,
          quantity : 1,
          description : _item.description,
          price : _item.price,
          name : _item.name
        });
      } else {
        items.push({
          id       : id,
          quantity : 1
        });
      }
    }
    this.updateCart(cart, items);
  }

  /**
   * Sends a cart update request.
   * @param  {Array} items
   * @return {Void}
   */
  updateCart(cart, items) {
    api.put(`/shop/carts/${ cart.id }`, {
      items : items
    }, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  /**
   * Submits the booking fees for payment.
   * @return {Void}
   */
  submitCart(cart) {
    let { bookingId, userId } = this.props;
    let user                  = auth.user();

    if (cart.items.length) {
      api.get('/shop/cards', {
        userId : userId
      }, (err, cards) => {
        if (!cards.length) {
          console.log('User has no registered payment cards!');
          return snackbar.notify({
            type    : `danger`,
            message : 'User has no registered payment cards!'
          });
        }
        api.post('/shop/orders', {
          bookingId   : bookingId,
          userId      : userId,
          cart        : cart.id,
          source      : cards[0].id,
          currency    : 'usd',
          description : `Payment for fees incurred during a waivecar ride.`,
          metadata    : {
            booking : bookingId
          }
        }, (err, order) => {
          if (err) {
            return snackbar.notify({
              type    : `danger`,
              message : err.message
            });
          }
          snackbar.notify({
            type    : `success`,
            message : 'Fees was successfully submitted, to manage payment check the stripe dashboard.'
          });
        });
      });
    } else {
      api.put(`/bookings/${bookingId}/close`, {}, (err) => {
        if (err) {
          return snackbar.notify({
            type    : `danger`,
            message : err.message
          });
        }
        snackbar.notify({
          type    : `success`,
          message : 'Successfully closed booking, no fees charged.'
        });
      });
    }
  }

  render() {
    let cart = this.state.carts.find(val => val.id === this.state.cartId);
    if (!cart) {
      return <div></div>;
    }
    return (
      <div className="box">
        <h3>Fees <small>List of fees to charge the booking</small></h3>
        <div className="box-content">
          <table className="fee-list">
            <thead>
              <tr>
                <th>Name</th>
                <th className="hidden-xs-down">Price</th>
                <th className="text-center">Quantity</th>
                <th className="hidden-xs-down text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              { this.getItems(cart) }
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4">
                  <div className="clearfix" style={{ borderTop : '1px solid #cecece', marginTop : 10, paddingTop : 10 }}>
                    <div className="pull-left" style={{ width : '50%' }}>
                      <strong>Total</strong>
                    </div>
                    <div className="pull-left text-right" style={{ width : '50%' }}>
                      ${ cart.total / 100 }
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
          <div className="fee-actions">
            <button className="btn btn-primary" onClick={ this.submitCart.bind(this, cart) }>Close Booking</button>
            <p>
              Closing the booking will submit the fees list for payment if any items has been added.
            </p>
          </div>
        </div>
      </div>
    );
  }

};

module.exports = BookingFeesView;
