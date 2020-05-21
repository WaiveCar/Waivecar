import React    from 'react';
import { auth } from 'bento';
import CardList from '../../components/user/cards/card-list';
import AddCard  from '../../components/user/cards/add-card';


module.exports = class ProfileCardsView extends React.Component {

  constructor(...args) {
    super(...args);
    this._user = auth.user();
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="profile">
        <CardList user={ this._user }></CardList>
        <AddCard user={ this._user }></AddCard>
      </div>
    );
  }

}
