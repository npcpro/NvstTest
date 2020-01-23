const express     = require('express');
const delay       = require('delay');
const bodyParser  = require('body-parser');
const port        = 3000;
const app = express()
      app.use(bodyParser.json({limit: '5mb'}));
      app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
      app.use("/user",require('./routers/user'))
      ///////////////////////////////////////////////////
      app.get('*',async function(req,res){
        res.sendStatus(404)
      })
      var appsever = app.listen(port,async function(){
              console.log('Start User Port ',port);
          })
