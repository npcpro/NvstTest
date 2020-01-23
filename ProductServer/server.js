const cors        = require('cors');
const path        = require('path');
const express     = require('express');
const session     = require('express-session');
const delay       = require('delay');
const moment       = require('moment');
const bodyParser  = require('body-parser');

const app = express()
      app.use(cors()) // dev only
      app.use(bodyParser.json({limit: '5mb'}));
      app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
      // app.use("/login"     ,require('./routers/login'))
      // app.use("/user"      ,require('./routers/user'))
      app.use("/product"   ,require('./routers/product'))
      // app.use("/order"     ,require('./routers/order'))


      ///////////////////////////////////////////////////
      app.get('*',async function(req,res){
        res.sendStatus(404)
      })

    })
