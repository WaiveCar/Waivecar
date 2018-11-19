'use strict';

let Sequelize  = require('sequelize');
let pluralize  = require('pluralize');
let sequelize  = Bento.provider('sequelize');
let error      = Bento.Error;
let changeCase = Bento.Helpers.Case;
let types      = Bento.Helpers.Type;

module.exports = (name, getModelSetup) => {

  let _model = getModelSetup({}, Sequelize);

  /**
   * @class SequelizeModel
   * @constructor
   * @param {Object} data
   */
  function SequelizeModel(data) {
    let attrs = this.getAttributes();
    data = changeCase.objectKeys('toCamel', data);
    for (let key in data) {
      if (attrs.indexOf(key) !== -1) {
        this[key] = data[key];
      }
    }
  }

  // ### Snake Case
  // Set field value to snake_case of the provided schema keys.
  // !Apparently underscored is not working as expected

  for (let key in _model.schema) {
    _model.schema[key].field = changeCase.toSnake(key);
  }

  /**
   * Defines the schema with the sequelize instance.
   * @property _schema
   * @type     Object
   */
  SequelizeModel.prototype._schema = SequelizeModel._schema = sequelize.define(name, changeCase.objectKeys('toCamel', _model.schema), Object.assign(
    {
      tableName : _model.table,
      paranoid  : _model.paranoid !== undefined ? _model.paranoid : true
    },
    _model.sequelizeOptionMap || {}
  ));

  /**
   * The resource identifier of the object.
   * @property {String} _resource
   */
  SequelizeModel.prototype._resource = SequelizeModel._resource = _model.resource || pluralize(changeCase.toSnake(name.split('/').pop()));

  SequelizeModel._relations = _model.relations;

  // A cheap type-checking system bacsed on the table name.
  _model.methods.isA = _model.methods.isA || function(what) {
    return _model.table.includes(what);
  }

  if (_model.tagSystem) {
    let model = _model.tagSystem.model;
    let key = _model.tagSystem.key;
    _model.methods = Object.assign(_model.methods || {}, {
      loadTagList : function* () {
        // sometimes the tagList is loaded by the name resolution depth is not.
        if(!this.tagList || (this.tagList.length && !this.tagList[0].groupRole)) {
          let group = Bento.model(model);
          let query = { 
            where: {},
            include: [
              {
                model: 'GroupRole',
                as: 'groupRole'
              }
            ]
          };
          query.where[key] = this.id;

          this.tagList = yield group.find(query);
        }
        return this.tagList;
      },

      getTagList : function* (filter, field = 'name') {
        function getTags(filter) {
          return tagList
            .filter((row) => { return filter ? row.group[field] === filter : true; })
            .map((row) => { return row.groupRole[field]; });
        }

        let tagList = yield this.loadTagList();

        if(Array.isArray(filter)) {
          return Array.prototype.concat.apply([], filter.map(getTags));
        }

        return getTags(filter);
      },

      getTag : function *(tag, field = 'name') {
        return (yield this.loadTagList()).filter((row) => {
          return row.groupRole[field] === tag;
        });
      },

      isTagged : function *(tag, field = 'name') {
        return (yield this.getTag(tag, field)).length;
      },

      hasTag : function *(tag, field = 'name') {
        return (yield this.getTag(tag, field)).length;
      },

      untag : function *(tag) {
        let record = yield this.getTag(tag);
        if(record.length) {
          let group = Bento.model(model);
          yield group.destroy({where: {id: record[0].id} });
        }
      },

      delTag : function *(tag) {
        return yield this.untag(tag);
      },

      updateTagList : function *(newList) {
        let _         = require('lodash')
        newList = newList.map((row) => { return row.toLowerCase(); });
        let oldTags = yield this.getTagList();
        var ix;

        let toRemove = _.difference(oldTags, newList);
        for(ix = 0; ix < toRemove.length; ix++) {
          yield this.untag(toRemove[ix]);
        }

        let toAdd = _.difference(newList, oldTags);
        for(ix = 0; ix < toAdd.length; ix++) {
          yield this.addTag(toAdd[ix]);
        }
      },

      addTag : function *(tag) {
        let record = yield this.hasTag(tag);
        if(record) {
          return record;
        }
        let GroupRole = Bento.model('GroupRole');
        let groupRecord = yield GroupRole.findOne({where: {name: tag}});
        if(groupRecord) {
          let group = Bento.model(model);
          let query = { groupRoleId: groupRecord.id };
          query[key] = this.id;
          let tag = new group(query);
          yield tag.save();
        }    
      }
    });

    _model.attributes = (_model.attributes || []).concat('tagList');
  };

  /**
   * Attributes that can be provided that is not part of the model schema.
   * @property {Array} _attributes
   */
  SequelizeModel.prototype._attributes = SequelizeModel._attributes = _model.attributes || [];

  /**
   * Attributes to remove before returning the model as JSON.
   * @property {Array} _blacklist
   */
  SequelizeModel.prototype._blacklist = _model.blacklist;

  // ### Static Methods

  SequelizeModel.count    = require('./count');
  SequelizeModel.find     = require('./find');
  SequelizeModel.findOne  = require('./findOne');
  SequelizeModel.destroy  = require('./destroy');
  SequelizeModel.findById = require('./findById');
  SequelizeModel.raw      = require('./raw');

  // ### Instance Methods

  SequelizeModel.prototype.save   = require('./save');
  SequelizeModel.prototype.upsert = require('./upsert');
  SequelizeModel.prototype.update = require('./update');
  SequelizeModel.prototype.delete = require('./delete');
  SequelizeModel.prototype.relay  = require('./relay');

  // ### Custom Methods


  if (_model.methods) {
    for (let key in _model.methods) {
      SequelizeModel.prototype[key] = _model.methods[key];
    }
  }

  /**
   * Returns a bentojs friendly sequelize error object.
   * @param  {String} type The query type in all uppercase.
   * @param  {Object} raw  The raw error object.
   * @return {Object}
   */
  SequelizeModel.prototype._error = SequelizeModel._error = function SequelizeError(type, raw) {
    let err = {};
    if (types.isArray(raw)) {
      err = raw.errors[0];
    } else {
      err = {
        type    : raw.name,
        message : raw.message,
        path    : null,
        value   : null
      };
    }
    return error.parse({
      code    : `SEQUELIZE_${ type }_ERROR`,
      message : changeCase.toCapital(err.message),
      data    : {
        type   : changeCase.toUpper(changeCase.toSnake(err.type)),
        path   : err.path,
        value  : err.value,
        fields : raw.fields,
        index  : raw.index
      }
    });
  };

  /**
   * Prepares the instance JSON representation.
   * @param  {Array} [attributes]
   * @return {Object}
   */
  SequelizeModel.prototype.toJSON = function toJSON(attributes) {
    let attrs = this.getAttributes();
    let data  = {};

    for (let i = 0, len = attrs.length; i < len; i++) {
      let key = attrs[i];
      if (this.hasOwnProperty(key)) {
        data[key] = this[key];
      }
    }

    if (this._blacklist && this._blacklist.length) {
      for (let i = 0, len = this._blacklist.length; i < len; i++) {
        let key = this._blacklist[i];
        if (data.hasOwnProperty(key)) {
          delete data[key];
        }
      }
    }

    if (types.isArray(attributes)) {
      for (let key in data) {
        if (attributes.indexOf(key) === -1) {
          delete data[key];
        }
      }
    }

    return data;
  };

  /**
   * Returns a list of defined data values on the instanced model.
   * @return {Object}
   */
  SequelizeModel.prototype._data = function _data() {
    let attributes = this._schema.attributes;
    let result     = {};
    for (let key in attributes) {
      if (!this.hasOwnProperty(key)) {
        continue;
      }
      result[key] = this[key];
    }
    return result;
  };

  /**
   * Compiles a list of attributes currently available in the model.
   * @return {Array}
   */
  SequelizeModel.prototype.getAttributes = function getAttributes() {
    let attrs = Object.keys(this._schema.attributes);
    if (this._attributes.length) {
      sortAttributes(attrs, this._attributes);
    }
    return changeCase.array('toCamel', attrs);
  };

  /**
   * Returns a custom sorted attributes list.
   * @param  {Array} source
   * @param  {Array} custom
   * @return {Array}
   */
  function sortAttributes(source, custom) {
    let after = {};

    // ### Parse Custom Attributes

    custom.forEach((val) => {
      let split = val.split('=>');
      if (split.length > 1) {
        after[split[0]] = split[1];
      } else {
        source.push(split[0]);
      }
    });

    // ### Insert After

    for (let key in after) {
      source.splice(source.indexOf(key) + 1, 0, after[key]);
    }

    return source;
  }

  return SequelizeModel;

};
