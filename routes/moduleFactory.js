const newsService = require('../modules/news/newsService');
const securityService = require('../modules/security/security');
const messagesService = require('../modules/messages/messagesService');
const formsService = require('../modules/dynamic/forms/formsService');
const genericService = require('../modules/dynamic/forms/genericService');

function getModule(name) {
  // console.log(name);
  switch (name){
    case 'news':{
      return newsService;
      break;
    }
    case 'form':{
      return formsService;
      break;
    }
    case 'generic':{
      return genericService;
      break;
    }
    case 'security':{
      return securityService();
      break;
    }
    case 'messages':{
      return messagesService;
      break;
    }
  }

};

module.exports.getModule = (name) => getModule(name);
