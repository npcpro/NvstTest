const fs = require("fs")
const root = require('path').dirname(require.main.filename);

module.exports = async (req, res, next) => {
       try {
         let field =  await fs.readFileSync(root+'/order_field.pub','utf-8').replace(/(\r\n|\n|\r|s)/gm,"").trim().toLowerCase()
         let token =  await fs.readFileSync(root+'/order.pub','utf-8').replace(/(\r\n|\n|\r|s)/gm,"").trim().toLowerCase()
         if(req.headers[field] === token){
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
