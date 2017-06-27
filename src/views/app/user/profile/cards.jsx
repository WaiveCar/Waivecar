import React    from 'react';
import { auth } from 'bento';
import CardList from '../../components/user/cards/card-list';
import AddCard  from '../../components/user/cards/add-card';


module.exports = class ProfileCardsView extends React.Component {

  constructor(...args) {
    super(...args);
  }

  componentDidMount() {
  }

  /**
   * @return {Object}
   */
  render() {
    let user = auth.user();
    return (
      <div className="profile">
        <CardList user={ user }></CardList>
        <AddCard user={ user }></AddCard>
      </div>
    );
  }

}
