const router = require('koa-router')();
// const authMiddleware = require('../shared/auth/auth.middleware').errorHandler();
const surveyModule = require('../modules/reports/survey/surveyReport')();
const parse = require('co-body');
const fs = require('fs-extra');
const koabusBoy = require('co-busboy');
const cmd = require('node-cmd');
const testPipeline = require('pipeline-test-node');
const mongoQuery = require('../utils/mongoQuery')();
const categoryService = require('../modules/categories/categoryService')();
const jwtMiddleware = require("../jwt/jwt");

const uuidv4 = require('uuid/v4');


function getModule(name) {
  switch (name) {
    case 'survey': {
      return surveyModule;
      break;
    }
    case 'poloLogger': {
      return poloLoggerModule;
      break;
    }
  }
}

router
  .prefix('/api/category')
  .use(jwtMiddleware.mainMiddleware())
  .use(async function (ctx, next) {
  // console.log("category 000");
  // var authHeader = ctx.req.headers.authorization;
  // var r = await jwt.verify(authHeader, config.tokenPassword);
  // ctx.request.body.tokenObj = r;

  return next().catch((err) => {
      throw err;
});
})
.post("/", async function (ctx) {
  // console.log("category");

  // const body = ctx.request.body;
  //
  // const resp = categoryService.addUpdateCategory(body);  //await ctx.app.people.insert(ctx.body);
  // return resp;

  const body = ctx.request.body;
  // console.log(body);

  const data = body.data;
  const method = body.proxy.method;
  const module = categoryService;


  const resp = await module[method](data, body.tokenObj);
  return resp;
})

module.exports = router;
