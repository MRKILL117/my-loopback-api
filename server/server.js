// Copyright IBM Corp. 2016,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
var bodyParser = require('body-parser');

const app = module.exports = loopback();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(bodyParser.urlencoded({extended: true})); //Configure body parser
app.use(loopback.token()); //Use access token

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      const explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // Auto update call
  autoUpdate();

  // Socket code
  io.on('connection', socket => {
    console.log("user has connected!!", socket);
  })

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

// Auto update functions
var autoUpdate = function(){
  var models = app.models();
  var modelsName = [];
  var dataSource = app.datasources.mysql;
  models.forEach((model) => {
    modelsName.push(model.modelName);
  })
  dataSource.autoupdate(modelsName, err => {
    if(err) throw err;
    else{
      console.log("Models updated succesfully!!");
      //Fil the database with the first use data
      // autoFillData().then((response) => {
      //   console.log("Auto Fill Successfully");
      // }).catch((err) => {
      //   throw err;
      // })
    }
  })
}
