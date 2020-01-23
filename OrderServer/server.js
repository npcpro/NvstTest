const express     = require('express');
const delay       = require('delay');
const bodyParser  = require('body-parser');
const port        = 6000;
const app = express()
      app.use(bodyParser.json({limit: '5mb'}));
      app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
      app.use("/order",require('./routers/order'))
      ///////////////////////////////////////////////////
      app.get('*',async function(req,res){
        res.sendStatus(404)
      })
      var appsever = app.listen(port,async function(){
              console.log('Start Order Port ',port);
          })
