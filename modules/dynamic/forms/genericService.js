const mongoQuery = require('../../../utils/mongoQuery')();
const ObjectID = require("mongodb").ObjectID;
const ioSocket = require("../../../modules/socket/ioSocket");

class GenericService {

  getCollection(name) {
    return mongoQuery.collection(name);
  }

  async add(data, tokenObj, info) {

    if(!tokenObj) {
      throw  "no token";
    }

    const {collection, fields} = info;

    data.userId = tokenObj.id;
    data.added = new Date();

    // if (fields) {
    //   var fieldsUpdated = {};
    //   for (var i = 0; i < fields.length; i++) {
    //     const field = fields[i];
    //     fieldsUpdated[field] = data[field];
    //   }
    // }

    var db = await this.getCollection(collection).insert(data);
    return db;
  }


  async edit(data, tokenObj, info) {

    console.log(info);
    if (!tokenObj) {
      throw  "no token";
    }

    if (!data._id) {
      throw 'no id';
    }
    data.modified = new Date();
    const {collection, fields} = info;

    var findCriteria = {
      _id: ObjectID(data._id),
      userId: tokenObj.id
    };


    var setCriteria = {};
    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        fieldsUpdated[field] = data[field];
      }
      setCriteria = {
        '$set': fieldsUpdated
      }
    } else {
      setCriteria = {
        '$set': data
      }
    }

    var db = await this.getCollection(collection).update(findCriteria, setCriteria, {
      upsert: true
    });

    return db;
  }

  async findById(data, tokenObj, info) {
    // data.userId = tokenObj.id;

    var filterCriteria = {
      _id: ObjectID(data._id)
    };

    const {collection, fields} = info;

    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        filterCriteria[field] = data[field];
      }
    }
    console.log(filterCriteria);
    const doc = await this.getCollection(collection).findOne(filterCriteria);
    return doc;
  }

  async findOne(data, tokenObj, info) {
    // data.userId = tokenObj.id;
    var filterCriteria = {
      _id: ObjectID(data._id),
      userId: tokenObj.id
    };

    const {collection, fields} = info;

    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        filterCriteria[field] = data[field];
      }
    }
    const doc = await this.getCollection(collection).findOne(filterCriteria);
    return doc;
  }

  async findList(data, tokenObj, info) {
    // data.userId = tokenObj.id;
    const filterCriteria = data || {};

    filterCriteria.userId = tokenObj.id;

    const {collection, fields} = info;

    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        filterCriteria[field] = data[field];
      }
    }

    const doc = await this.getCollection(collection).find(filterCriteria).toArray();
    return doc;
  }


  async removeOne(data, tokenObj, info) {
    if(data && data._id) {
      data._id =  ObjectID(data._id);
    }
    const filterCriteria = data || {};

    filterCriteria.userId = tokenObj.id;

    const {collection, fields} = info;

    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        filterCriteria[field] = data[field];
      }
    }

    const doc = await this.getCollection(collection).deleteOne(filterCriteria);
    return doc;
}

async remove(data, tokenObj, info) {
    if(data && data._id) {
      data._id =  ObjectID(data._id);
    }
    const filterCriteria = data || {};

    filterCriteria.userId = tokenObj.id;

    const {collection, fields} = info;

    if (fields) {
      var fieldsUpdated = {};
      for (var i = 0; i < fields.length; i++) {
        const field = fields[i];
        filterCriteria[field] = data[field];
      }
    }

    const doc = await this.getCollection(collection).delete(filterCriteria);
    return doc;
}
  async page(obj, tokenObj, info) {
    if(!obj.pager) {
      throw "no pager";
    }

  const {collection, fields} = info;

   const filterCriteria = obj.filter || {};
    var filter = this.getCollection()
        .find(filterCriteria);

    obj.pager.itemsOnPage = parseInt(obj.pager.itemsOnPage);
      obj.pager.pageNo--;
      filter = filter.limit(obj.pager.itemsOnPage)
          .skip(obj.pager.itemsOnPage * obj.pager.pageNo);
      // query = query.sort({
      //   dateAdded: -1
      // });
    // filter = filter.toArray();
    const items = await filter.toArray();

    // console.log(questions);
    const count = await this.getCollection(collection).count(filterCriteria);
    return {
      items,
      count: count,
      pageNo: obj.pager ? obj.pager.pageNo + 1 : 0
    };
}


}

module.exports = new GenericService();
