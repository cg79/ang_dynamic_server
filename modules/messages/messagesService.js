const mongoQuery = require('../../utils/mongoQuery')();
const ObjectID = require('mongodb').ObjectID;
const coreUtils = require('../../utils/core.utils')();
const emailService = require('../email/email')();

class MessagesService {
  // api/pub
  // {
  //   "proxy":{
  //   "method":"addContactMessage",
  //     "module": "messages"
  // },
  //   "data":{
  //   "message" :"salut",
  //     "email":"test@tes1t.com",
  //     "title" :"ttt"
  // }
  async addContactMessage(data) {
    const { email, message, title } = data;
    let { _id, toEmail } = data;

    if (!toEmail) {
      toEmail = 'office@fullsd.ro';
    }

    if (!_id) {
      const record = await mongoQuery.collection('messages').findOne({ email });
      console.log(record);
      if (record) {
        _id = record._id;
      }
    }


    const findCriteria = {};
    if (_id) {
      findCriteria._id = ObjectID(_id);
    } else {
    // findCriteria._id = new ObjectID();
      findCriteria.fromEmail = email;
      findCriteria.toEmail = toEmail;
      findCriteria.hash = coreUtils.hash(email, toEmail);
    }


    const setCriteria = {
      $push: {
        items: {
          id: coreUtils.uuid(),
          title: title || '',
          date: new Date(),
          message: message || '',
          read: false,
        },
      },
      $inc: {
        msgCount: 1,
      },
    };

    const dbMessages = await mongoQuery.collection('messages').update(findCriteria, setCriteria, {
      upsert: true,
    });
    console.log('ddddd');
    emailService.emailMessageReceived(data);
    return dbMessages;
  }

  // {
  //   "proxy":{
  //     "method":"addReplyMessage",
  //     "module": "messages"
  //   },
  //   "data":{
  //     "message" :"salut",
  //     "email":"test@tes1t.com",
  //     "title" :"ttt",
  //     "_id":"5b0d6512752717bcd30afeef",
  //     "id": "848d0951-f153-a413-56f9-65e7e3acf302"
  //   }
  //  }
  async addReplyMessage(data) {
    const { _id, id, message } = data;

    const findCriteria =
    {
      _id: ObjectID(_id),
    };

    const itemId = coreUtils.uuid();
    const setCriteria = {
      $push: {
        items: {
          id: itemId,
          date: new Date(),
          message: message || '',
          read: false,
          parentId: id,
        },
      },
    };

    const dbMessages = await mongoQuery.collection('messages').update(findCriteria, setCriteria, {
      upsert: true,
    });

    const updateFilter = {
      _id: ObjectID(_id),
      'items.id': id,
    };

    const updateCriteria = {
      $push: {
        'items.$.msgs': itemId,
      },
    };

    console.log(updateFilter);
    const updateResult = await mongoQuery.collection('messages').update(updateFilter, updateCriteria, false);

    return {
      dbMessages,
      updateResult,
    };
  }

  // {
  //   "proxy":{
  //     "method":"findItemsForParent",
  //     "module": "messages"
  //   },
  //   "data":{
  //     "message" :"salut",
  //     "email":"test@tes1t.com",
  //     "title" :"ttt",
  //     "_id":"5b0d6512752717bcd30afeef",
  //     "parentId": "848d0951-f153-a413-56f9-65e7e3acf302"
  //   }
  //  }
  async findItemsForParent(data) {
    const { _id, parentId } = data;

    const findCriteria = {
      _id: ObjectID(_id),
      'items.message': 'salut1',
    };

    const selection = {
      items: {
        $elemMatch: {
          $eq: {
            'items.message': 'salut1',
          },
        },
      },
    };
    // const dbMessages = await mongoQuery.collection('messages').aggregate(
    //   { $match: {_id: ObjectID(_id) }},
    //   { $unwind: '$items'},
    //   { $match: {'items.status':1}}).toArray();

    // const dbMessages =  await mongoQuery.collection('messages').find(
    //   { 'items.title': 'salut1'},
    // { 'items.$': 1 });
    
    // return dbMessages;

    const agg = [];
    agg.push({
      $match: {
        _id: ObjectID(_id),
      },
    });

    const projection = {};
    projection.$project = {
      items: {
        $filter: {
          input: '$items',
          as: 'item',
          cond: {
            $eq: ['$$item.parentId', parentId],
          },
        },
      },
    };
    agg.push(projection);

    const dbMessages = await mongoQuery.collection('messages').aggregate(agg).toArray();
    return dbMessages;
  }
}

module.exports = new MessagesService();
