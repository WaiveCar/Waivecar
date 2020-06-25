import React, {Component} from 'react';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import OrganizationResource from './organization-resource-table.jsx';
import {auth, api} from 'bento';
import {snackbar} from 'bento-web';

function SelectedList({list, word, ctx, unSelect}) {
  return (
    <div>
      <h4>Selected To {word}</h4>
      {list.map((item, i) => (
        <div key={i} className="row">
          <div style={{padding: '10px 0'}} className="col-xs-6">
            <Link to={`/cars/${item.id}`} target="_blank">
              {item.license}
            </Link>
          </div>
          <button className="btn btn-link col-xs-6" onClick={() => unSelect(i)}>
            {' '}
            Unselect
          </button>
        </div>
      ))}{' '}
    </div>
  );
}

class Hub extends Component {
  constructor(props) {
    super(props);
    let {id, hubId} = this.props.params;
    this.state = {
      hub: null,
      id,
      hubId,
      showAddCars: false,
      searchResults: [],
      selectedToAdd: [],
      selectedCurrent: [],
      carSearchWord: '',
    };
    this._user = auth.user();
  }

  componentDidMount() {
    let {id, hubId} = this.state;
    if (!this._user.canSee('organization', {id})) {
      return this.props.history.replaceState({}, '/forbidden');
    }
    api.get(`/locations/${hubId}`, (err, hub) => this.setState({hub}));
  }

  carSearch() {
    let {carSearchWord, hub} = this.state;
    api.get(
      `/cars/search/?search=${carSearchWord}${
        this._user.organizations.length
          ? `&organizationIds=[${hub.organizationId}]`
          : ''
      }`,
      (err, response) => {
        if (err) {
          return snackbar.notify({
            type: 'danger',
            message: err.message,
          });
        }
        this.setState({searchResults: response});
      },
    );
  }

  addCars() {
    let {selectedToAdd, hubId} = this.state;
    api.post(
      `/locations/${hubId}/addCars`,
      {carList: selectedToAdd.map(c => c.id)},
      (err, res) => {
        if (err) {
          snackbar.notify({
            type: 'danger',
            message: err.message,
          });
          return setTimeout(() => window.location.reload(), 2000);
        }
        this.setState(
          {carSearchWork: '', searchResults: [], selectedToAdd: []},
          () => window.location.reload(),
        );
      },
    );
  }

  removeCars() {
    let {selected, hubId} = this.state;
    api.post(
      `/locations/${hubId}/addCars`,
      {carList: selected.map(c => c.id)},
      (err, res) => {
        if (err) {
          snackbar.notify({
            type: 'danger',
            message: err.message,
          });
          return setTimeout(() => window.location.reload(), 2000);
        }
        this.setState(
          {carSearchWork: '', searchResults: [], selected: []},
          () => window.location.reload(),
        );
      },
    );
  }

  toggleForDelete(i) {
    let {toDelete} = this.state;
  }

  render() {
    let {
      id,
      hubId,
      showAddCars,
      carSearchWord,
      searchResults,
      selectedToAdd,
      selectedCurrent,
    } = this.state;
    return (
      <div className="box">
        <h3></h3>
        <div className="box-content">
          <button
            className="btn btn-primary"
            onClick={() => this.setState({showAddCars: !showAddCars})}>
            {!showAddCars ? 'Add Cars' : 'hide'}
          </button>
          {showAddCars && (
            <div>
              <div>
                <h4>Car Search</h4>
                <div className="row" style={{marginTop: '10px'}}>
                  <input
                    onChange={e =>
                      this.setState({carSearchWord: e.target.value})
                    }
                    value={carSearchWord}
                    style={{marginTop: '1px', padding: '2px', height: '40px'}}
                    className="col-xs-6"
                    placeholder="Car Name"
                  />
                  <button
                    className="btn btn-primary btn-sm col-xs-6"
                    onClick={() => this.carSearch()}>
                    Find Car
                  </button>
                </div>
                {searchResults.length
                  ? searchResults.map((item, i) => (
                      <div key={i} className="row">
                        <div style={{padding: '10px 0'}} className="col-xs-6">
                          <Link to={`/cars/${item.id}`} target="_blank">
                            {item.license}
                          </Link>
                        </div>
                        <button
                          className="btn btn-link col-xs-6"
                          onClick={() =>
                            this.setState({
                              selectedToAdd: !selectedToAdd.find(
                                car => car.id === item.id,
                              )
                                ? [...selectedToAdd, item]
                                : selectedToAdd,
                            })
                          }>
                          {' '}
                          Select
                        </button>
                      </div>
                    ))
                  : ''}
                {selectedToAdd.length ? (
                  <SelectedList
                    list={selectedToAdd}
                    word={'Add'}
                    ctx={this}
                    unSelect={i => {
                      this.setState({
                        selectedToAdd: selectedToAdd
                          .slice(0, i)
                          .concat(selectedToAdd.slice(i + 1)),
                      });
                    }}
                  />
                ) : (
                  ''
                )}
              </div>
              <button
                className="btn btn-primary"
                onClick={() => this.addCars()}>
                Add to hub
              </button>
            </div>
          )}
          <OrganizationResource
            ref="cars-resource"
            resource={'cars'}
            resourceUrl={'carsWithBookings'}
            queryOpts={`&hubId=${hubId}`}
            organizationId={id}
            header={() => (
              <tr ref="sort">
                <ThSort sort="id" value="Id" ctx={this.refs['cars-resource']} />
                <ThSort
                  sort="license"
                  value="Name"
                  ctx={this.refs['cars-resource']}
                />
                <ThSort
                  sort="maintenanceDueIn"
                  value="Maintenance Due In"
                  ctx={this.refs['cars-resource']}
                />
                <th>Select</th>
              </tr>
            )}
            row={item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <Link to={`/cars/${item.id}`}>{item.license}</Link>
                </td>
                <td>{item.maintenanceDueIn} miles</td>
                <td>
                  <button
                    className="btn btn-link col-xs-6"
                    onClick={() => {
                      let {selectedCurrent} = this.state;
                      this.setState({
                        selectedCurrent: !selectedCurrent.find(
                          car => car.id === item.id,
                        )
                          ? [...selectedCurrent, item]
                          : selectedCurrent,
                      });
                    }}>
                    Click
                  </button>
                </td>
              </tr>
            )}
          />
          {selectedCurrent.length ? (
            <SelectedList
              list={selectedCurrent}
              word={'Remove'}
              ctx={this}
              unSelect={i => {
                this.setState({
                  selectedCurrent: selectedCurrent
                    .slice(0, i)
                    .concat(selectedCurrent.slice(i + 1)),
                });
              }}
            />
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

export default Hub;
