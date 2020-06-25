import React, {Component} from 'react';
import ThSort from '../components/table-th';
import {Link} from 'react-router';
import OrganizationResource from './organization-resource-table.jsx';
import {auth, api} from 'bento';
import {snackbar, GMap} from 'bento-web';

function SelectedList({list, word, ctx, unSelect, action}) {
  return (
    <div>
      <h4 style={{marginTop: '2rem'}}>Selected To {word}</h4>
      <div style={{marginLeft: '3rem', marginRight: '3rem'}}>
        {list.map((item, i) => (
          <div key={i} className="row">
            <div style={{padding: '10px 0'}} className="col-xs-6">
              <Link to={`/cars/${item.id}`} target="_blank">
                {item.license}
              </Link>
            </div>
            <button
              className="btn btn-link col-xs-6"
              onClick={() => unSelect(i)}>
              {' '}
              Unselect
            </button>
          </div>
        ))}{' '}
      </div>
      <button className="btn btn-primary" onClick={() => action()}>
        {word} cars
      </button>
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
      currentCars: [],
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
      `/cars/search/?search=${carSearchWord}&organizationIds=[${hub.organizationId}]`,
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
    let {selectedCurrent, hubId} = this.state;
    api.post(
      `/locations/${hubId}/removeCars`,
      {carList: selectedCurrent.map(c => c.id)},
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
      hub,
      currentCars,
    } = this.state;
    return (
      hub && (
        <div className="box">
          <h3>{hub.name}</h3>
          <div className="box-content">
            <div className="row" style={{marginBottom: '1.5rem'}}>
              <div className="col-xs-12">
                <div className="map-dynamic">
                  <GMap
                    markerIcon={'/images/map/icon-homebase.svg'}
                    markers={[
                      hub,
                      ...currentCars.map(car => {
                        car.type = 'start';
                        return car;
                      }),
                    ]}
                    orgId={hub.organizationId}
                    forOrg
                  />
                </div>
              </div>
            </div>
            <h4 style={{marginTop: '1rem'}}>Current Cars</h4>
            <OrganizationResource
              ref="cars-resource"
              resource={'cars'}
              resourceUrl={'carsWithBookings'}
              queryOpts={`&hubId=${hubId}`}
              organizationId={id}
              updateParent={data => this.setState({currentCars: data})}
              header={() => (
                <tr ref="sort">
                  <ThSort
                    sort="id"
                    value="Id"
                    ctx={this.refs['cars-resource']}
                  />
                  <ThSort
                    sort="license"
                    value="Name"
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
                action={() => this.removeCars()}
              />
            ) : (
              ''
            )}
            <button
              className="btn btn-primary"
              style={{marginTop: '1rem'}}
              onClick={() => this.setState({showAddCars: !showAddCars})}>
              {!showAddCars ? 'Add Cars' : 'hide'}
            </button>
            {showAddCars && (
              <div>
                <div>
                  <h4 style={{marginTop: '2rem'}}>Car Search</h4>
                  <div
                    className="row"
                    style={{margin: '2rem', marginBottom: '0.5rem'}}>
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
                        <div
                          key={i}
                          className="row"
                          style={{marginLeft: '2rem', marginRight: '2rem'}}>
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
                      action={() => this.addCars()}
                    />
                  ) : (
                    ''
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    );
  }
}

export default Hub;
