const mg         = require('../CONFIG/mongodb');
const moment     = require('moment')
const jwt_decode = require('jwt-decode')

module.exports = async (req,res,next) => {
      try {
              let token    = JSON.parse(req.headers.authorization).token
              let jwt_token  = await mg.getOne('jwt',{token:token})
              let data     = jwt_decode(token)
              let datediff = moment().diff(moment(data.exp*1000),'seconds')
              let chkStatus = false

              if(token && jwt_token && datediff < 0){
                chkStatus = true
              }else if (token && !jwt_token && datediff < 0){
                  let chk_authen = true
                  if(chk_authen){
                    console.log({token:token,ip:req.connection.remoteAddress},'insert collection');
                    let rs = await mg.insertCollection('jwt',{token:token,ip:req.connection.remoteAddress})
                    console.log(rs,'rs');
                    if(rs)chkStatus = true
                    // console.log('pass');
                  }
              }
              if(chkStatus){
                // console.log('Pass');
                next()
              }else{
                await mg.deleteOne('jwt',{token:token})
                console.log('invalid');
                res.status(401).send('token invalid')
              }
          } catch (e) {
              res.sendStatus(503)
          }
}
