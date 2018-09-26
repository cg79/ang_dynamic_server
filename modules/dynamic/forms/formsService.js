const mongoQuery = require('../../../utils/mongoQuery')();
const ObjectID = require("mongodb").ObjectID;


class FormsService {

  getFormCollection() {
    return mongoQuery.collection('forms');
  }

  async add(data, tokenObj) {
    console.log(data);

    if(!tokenObj) {
      throw  "no token";
    }
    
    var data = {
        name: data.name,
        structure: data.structure,
        userId: tokenObj.id
    }

    var dbQuestion = await this.getFormCollection().insert(data);
    return dbQuestion;
  }

  async edit(data, tokenObj) {
    console.log(data);

    if(!tokenObj) {
      throw  "no token";
    }

    if (!data._id) {
      throw 'no id';
    }

    var findCriteria = {};
    findCriteria._id = ObjectID(data._id);

    var setCriteria = {
      '$set': {
        structure: data.structure
      }
    }

    var dbQuestion = await this.getFormCollection().update(findCriteria, setCriteria, {
      upsert: true
    });

    return dbQuestion;
  }


  async getByName(data, tokenObj) {
  // data.userId = tokenObj.id;
  const filterCriteria = {
    name: data.name,
    userId: tokenObj.id
  };
  const doc = await this.getFormCollection().findOne(filterCriteria);
  return doc;
}

async getForm(data, tokenObj) {
  // data.userId = tokenObj.id;
  const filterCriteria = {
    _id: ObjectID(data._id),
    userId: tokenObj.id
  };
  const doc = await this.getFormCollection().findOne(filterCriteria);
  return doc;
}


  async getForms(data, tokenObj) {
    //data.userId = tokenObj.id;
  const filterCriteria = data.filter || {};
  const doc = await this.getFormCollection().find(filterCriteria).toArray();
    return doc;
}

async deleteForm(data, tokenObj) {
  const { filterCriteria } = data.filter;
  if(!filterCriteria) {
    throw "no filter criteria";
  }
  const doc = await this.getFormCollection().remove(filterCriteria);
    return doc;
}

  async getPaged(obj, tokenObj) {
    if(!obj.pager) {
      throw "no pager";
    }

   const filterCriteria = obj.filter || {};
    var filter = this.getFormCollection()
        .find(filterCriteria);

    obj.pager.itemsOnPage = parseInt(obj.pager.itemsOnPage);
      obj.pager.pageNo--;
      filter = filter.limit(obj.pager.itemsOnPage)
          .skip(obj.pager.itemsOnPage * obj.pager.pageNo)
      // query = query.sort({
      //   dateAdded: -1
      // });
    // filter = filter.toArray();
    const items = await filter.toArray();

    // console.log(questions);
    const count = await this.getFormCollection().count(filterCriteria);
    return {
      items,
      count: count,
      pageNo: obj.pager ? obj.pager.pageNo + 1 : 0
    };
}


}

module.exports = new FormsService();
