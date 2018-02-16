'use strict';

let error  = Bento.Error;

let Tag    = Bento.model('Tag');
let Car    = Bento.model('Car');
let CarTag = Bento.model('CarTag');

let User   = Bento.model('User');

let config = Bento.config;

class TagService {

  static *create(payload) {

    let tag = new Tag(payload);

    yield tag.save();

    tag.relay({
      type: 'store'
    });

  }

  static *update(id, payload) {
    let tag = yield Tag.findById(id);
    yield tag.update(payload);
  }

  static *delete(id) {
    let tag = yield Tag.findById(id);
    if(tag) {
      yield tag.delete();
    }
  }

  static *index() {
    let query = {};

    query.order = [
      ['created_at', 'DESC']
    ];
    return yield Tag.find(query);
  }

  static *addToCar(tagId, carId) {
    let carTag = new CarTag({
      tagId: tagId,
      carId: carId
    });

    yield carTag.save();

    carTag.relay({
      type: 'store'
    });
  }

  static *removeFromCar(tagId, carId) {
    let carTag = yield CarTag.findOne({
      where : {
        tagId: tagId,
        carId: carId
      }
    });

    if(carTag) {

      yield carTag.delete();
    }
  }
};

module.exports = TagService;
