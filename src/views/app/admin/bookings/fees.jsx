import React          from 'react';
import { api, relay } from 'bento';

module.exports = class BookingFeesView extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      items : []
    };
    relay.subscribe(this, 'carts');
  }

  componentDidMount() {
    api.get(`/shop/items`, (err, items) => {
      if (err) {
        return console.log(err);
      }
      this.setState({ items : items });
      this.loadCart(this.props.cartId);
    });
  }

  componentWillReceiveProps(nextProps) {
    this.loadCart(nextProps.cartId);
  }

  componentWillUnmount() {
    relay.unsubscribe(this, 'carts');
  }

  /**
   * Loads booking.
   * @param  {String} id
   * @return {Void}
   */
  loadCart(id) {
    api.get(`/shop/carts/${ id }`, (err, cart) => {
      if (err) {
        return console.log(err);
      }
      relay.dispatch('carts', {
        type : 'store',
        data : cart
      });
    });
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

      return (
        <tr key={ item.id } className="fee-item-row">
          <td>{ item.name }</td>
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
      items.push({
        id       : id,
        quantity : 1
      });
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
   * Renders the fees/cart view.
   * @return {Object}
   */
  render() {
    let cart = this.state.carts.find(val => val.id === this.props.cartId);
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
        </div>
      </div>
    );
  }

};
