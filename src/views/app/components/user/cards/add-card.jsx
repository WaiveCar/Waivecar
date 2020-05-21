import React from 'react';
import {auth} from 'bento';
import {Form} from 'bento-web';
import Shop from '../../../lib/shop-service';
import ReactSelect from 'react-select';

// ### Form Fields
let formFields = {
  card: require('./form-fields/card'),
};

class AddCard extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired,
    currentUser: React.PropTypes.bool,
  };

  static defaultProps = {
    ...React.Component.defaultProps,
    currentUser: true,
  };

  constructor(...options) {
    super(...options);

    this.user = this.props.user;
    this.state = {
      selectedOrganization: this.user.organizations[0].organization.name,
    };
    this.shop = new Shop(this);
  }

  /**
   * Sets up the profile with its stripe data and hides the default
   * application view header.
   */
  componentDidMount() {
    let user = this.props.user;
    this.shop.ensureCustomer(user);
  }

  render() {
    let {selectedOrganization} = this.state;
    return (
      <div className="box">
        <h3>
          Add Card
          <small>Add a new payment card to your waivecar account.</small>
        </h3>
        <div className="box-content">
          <ReactSelect
            name={'organizationSelect'}
            defaultValue={0}
            value={selectedOrganization}
            options={this.user.organizations.map((org, i) => ({
              label: org.organization.name,
              value: i,
            }))}
            onChange={e =>
              this.setState({selectedOrganization: e, showOrg: false}, () =>
                this.setState({showOrg: true}),
              )
            }
          />
          <Form
            ref="personal"
            className="bento-form-static"
            fields={formFields.card}
            default={{}}
            buttons={[
              {
                value: 'Add Card',
                type: 'submit',
                class: 'btn btn-primary btn-profile-submit',
              },
            ]}
            submit={(data, reset) => {
              this.shop.submitCard(this.props.user, data, reset);
            }}
          />
        </div>
      </div>
    );
  }
}

module.exports = AddCard;
