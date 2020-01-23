const fs = require("fs")
const root = require('path').dirname(require.main.filename);

module.exports = async (req, res, next) => {
       try {
         if(req.headers.token === 'bbb'){
           next()
         }else {
           console.log('invalid token');
           res.sendStatus(401)
           // res.send('ACCESS DENINE')
         }

       } catch (error) {
         console.log(error,'chkauthentoken');
         res.sendStatus(401)
         // res.send('ACCESS DENINE')
       }
}
