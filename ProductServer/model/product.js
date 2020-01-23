const fs         = require('fs');
const delay      = require('delay');
const mg         = require('../CONFIG/mongodb');
const fn         = require('../include/index')
const lnc        = require('../include/include')
const clean      = require('../include/clean_contact')
const ebayEnd    = require('../include/ebayEnd')
const ebayAdd    = require('../include/ebayAdd')
const ebayPrice  = require('../include/ebayPrice')
const ebayDetail = require('../include/ebayDetail')
const moment     = require('moment');
const superagent = require('superagent');
                   require('superagent-proxy')(superagent);
const jsontoxml  = require('jsontoxml');
const xml        = require('xml');
const convert    = require('xml-js');
const asin_detail_task = require('../autorun/find/asin_detail')
const asinitem_price   = require('../autorun/find/asin_item_request')
const mongoose   = require('mongoose')
const socket     = require('../socket')


var maxTask = 0;
var doneTask = 0;
// var allBlockbrand;

exports.show = async (req,res) => {
        let  rs = []
        let  dataRows = 0
        try {
              let storeid = req.params.storeid
              let min = Number(req.params.min)
              let max = Number(req.params.max)

              let Callmodel = await mg.callModel('asin_item')
                   dataRows = await Callmodel.find({"storeid":new mongoose.Types.ObjectId(storeid),ended:{$ne:true}},{itemid:1}).countDocuments()
                        rs  = await mg.getDataAgg('asin_item',
                                                [
                                                  {$match:{"storeid":new mongoose.Types.ObjectId(storeid)}},
                                                  { $lookup:{
                                                             from: 'asin_details',
                                                             let: {'dataasin':'$dataasin'},
                                                             pipeline: [
                                                                            {$match:{$expr:{$eq:['$dataasin','$$dataasin']}}},
                                                                            {$project:{price:1,instock:1,mainImg:1}}
                                                                        ],
                                                             as: 'jointable',
                                                           }
                                                  },
                                                  {$limit: max},
                                                  {$skip : min},
                                                ])
               if(rs){
                 for (var k in rs) {
                   let i =  rs[k];
                            rs[k].price    = (i.jointable[0]) ? i.jointable[0].price : 0
                            rs[k].instock  = (i.jointable[0]) ? i.jointable[0].instock : false
                            rs[k].mainImg  = (i.jointable[0]) ? i.jointable[0].mainImg : ''
                  }
                  rs = rs.filter(i=>!i.ended)
                  // console.log({count:rs.length,min:min,max:max,storeid:storeid,dataRows:dataRows});
               }

            } catch (e) {
              console.log(e,'catch on get asin_item');
            }
            res.send({data:rs,dataRows:dataRows})


}
exports.add = async (req,res) => {
        let storeid = req.params.storeid
        console.log('add data to stores :',storeid);
        let chkStatus = false
        let obj       = req.body
        if(obj.length){
        let asinOnly  = []
        let asinItem  = []
            obj.forEach((i,k) => {
                i.storeid = storeid
                if(i.itemid)asinItem.push(i)
                else asinOnly.push(i)
            });
        // if(asinOnly.length) await runAddItem(asinOnly) // wait
        if(asinItem.length){
          runUpdateItem(asinItem,storeid)
          chkStatus = true
          }
        }
        res.send({result:chkStatus,data:''})
}

exports.updateprice = async (req,res) => {
        console.log('updateprice');
        let trytime   = 20
        let dataasin  = req.body.dataasin
        let itemid    = req.body.itemid
        let storeid   = req.params.storeid
        let chkStatus = false
        let response  = {}
        let msg       = ''
        let resultPrice    =  await findasin_price(dataasin,trytime)
            response  = await ebayPrice.update(mg,dataasin,itemid,storeid,req.body)
            if(response.status == true)chkStatus = true
            msg = response.msg
        console.log({status:chkStatus,msg:msg,itemidPrice:response.itemidPrice,price:resultPrice.price},'resultPrice');
        res.send({status:chkStatus,msg:msg,itemidPrice:response.itemidPrice,price:resultPrice.price})

}

exports.updatedetail = async (req,res) => {
        console.log('updatedetail');
        let input     = req.body
        let dataasin  = input.dataasin
        let itemid    = input.itemid
        let chkStatus = false
        let trytime   = 15
        let response  = {}
        let msg       = ''
        let resultPrice    =  await findasin_price(dataasin,trytime)
        let resultDetail   =  await findasin_detail(dataasin,trytime)
        // console.log({resultPrice:resultPrice,resultDetail:resultDetail});
        // if(resultPrice.status && resultDetail.status){
           await clean.run(dataasin)
           response  = await ebayDetail.update(mg,dataasin,itemid,input)
          if(response.status == true) chkStatus = true
            msg = response.msg
        // }else{
        //   msg      = ` STATUS NOT COMPLETE [ PRICE : ${resultPrice.status} | DETAIL : ${resultDetail.status} ]`
        //   mg.insertCollection('asin_item_updateitemlogs',{status:chkStatus,errorMsg:msg,input:input})
        // }
        console.log({status:chkStatus,msg:msg,itemidPrice:response.itemidPrice,price:resultPrice.price},'resultPrice');
        res.send({status:chkStatus,msg:msg,itemidPrice:response.itemidPrice,price:resultPrice.price})

}
exports.delete = async (req,res) => {
      console.log('delete data');
      let storeid = req.params.storeid
      let obj = req.body
      let user = obj.user
      let dataasin = obj.dataasin
      let itemid = obj.itemid
      try {
        let rs = await ebayEnd.call(mg,dataasin,itemid,storeid,user)
        console.log(rs);
        res.send(rs)
        // res.sendStatus(200)
      } catch (e) {
        console.log(e);
        res.sendStatus(401)
      }
}

exports.deleteinstore = async (req,res) => {
      // let storeid = req.params.storeid
      // console.log('delete data in store : ',storeid);
      // try {
      //   let rs = await mg.deleteMany('asin_item',{storeid:storeid})
      //   console.log(rs);
      //   res.sendStatus(200)
      // } catch (e) {
      //   console.log(e);
      //   res.sendStatus(401)
      // }
      res.sendStatus(401)

}


async function selectNotInAsin(arAsin){
      console.log('-------<');
      let existsAsin = await mg.getDataCustom('asin_detail',{$and:[ {$where:`this.name && this.category && this.featureBullets`},
                                                                    {dataasin:{$in:arAsin.map(i => i.dataasin)}}]
                                                            },
                                                            {dataasin:1})
      let mapExits   = existsAsin.map(i=>i.dataasin).sort().join()
      let mapOnly    = arAsin.map(i=>i.dataasin).sort().join()
      if(mapExits != mapOnly){
        console.log('split obj ');
        arAsin = lnc.objNotIn(arAsin,existsAsin,'dataasin')
      }else{
        arAsin =  []
      }
      return arAsin
}

async function findasin_price(dataasin,trytime){
      console.log('start findasin_price');
      let url       = `https://www.amazon.com/gp/offer-listing/${dataasin}/ref=olp_f_new?f_primeEligible=true&f_new=true`
      let proxyObj  = await mg.getData('setting_proxy',{$and:[{$where:'this.host'},{active :true},{blocked:false},{cc:'US'}]},{updatedAt:-1},trytime)
      let by        = ''
      let price     = 0
      let chkStatus = false
      let maxReqeust = proxyObj.length
      let reciveRequest = 0
          for (let i = 0 ; i < proxyObj.length ;i++) {
               let proxy      = proxyObj[i]
               let proxy_url  = lnc.setproxyUrl(proxy)
               let userAgent = await mg.getDataAgg('useragent',[{ $sample: { size: maxReqeust} } ])
                   lnc.reqestProxySet(proxy_url,url,false,userAgent[i]).then(html => {
                       reciveRequest++
                       let $             = lnc.gethtml(html.text)
                           price         = Number(lnc.getPrice($))
                           by            = $('div[id="olpProductByline"]').text().replace(/(\r\n|\n|\r)/gm,"").replace('by','').trim() || $('h1[class="a-size-large a-spacing-none"]').text().replace(/(\r\n|\n|\r)/gm,"").replace('by','').trim().split(" ")[0]
                           console.log('found : ',reciveRequest,{price:price,by:by},' : ',price > 5,by != '')
                           if(price > 5 && by != '' && !chkStatus){
                             chkStatus = true
                             mg.setOnInsert('asin_detail',{dataasin:dataasin},{$set:{price:price,by:by,instock:chkStatus}})
                           }else {
                             mg.setOnInsert('asin_detail',{dataasin:dataasin},{$set:{instock:chkStatus}})
                           }

                   }).catch(e => {
                     reciveRequest++
                     console.log('catch : ',reciveRequest);
                     lnc.updateIpStatus(mg,proxy,0,1)
                   })
               }

               for (var i = 0; i < 1;) {
                 await delay(200)
                 console.log('maxReqeust : ',maxReqeust,' reciveRequest : ',reciveRequest);
                 if(maxReqeust <= reciveRequest || chkStatus){
                   i=2;
                  }
               }
          return {status:chkStatus,price:price}
}

async function findasin_detail(dataasin,trytime){
      console.log('start findasin_detail');
      let url        = `https://www.amazon.com/dp/${dataasin}/ref=twister_dp_update?psc=1&`
      let proxyObj  = await mg.getData('setting_proxy',{$and:[{$where:'this.host'},{active :true},{blocked:false},{cc:'US'}]},{updatedAt:1},trytime)
      let productDetail = {}
      let chkStatus = false
      let maxReqeust = proxyObj.length
      let reciveRequest = 0
          for (let i=0 ; i < proxyObj.length ;i++) {
               let proxy      = proxyObj[i]
               let proxy_url  = lnc.setproxyUrl(proxy)
               let userAgent = await mg.getDataAgg('useragent',[{ $sample: { size: maxReqeust} } ])
                   lnc.reqestProxySet(proxy_url,url,false,userAgent[i]).then(html => {
                     reciveRequest++
                     let $ = lnc.gethtml(html.text)
                             $('i[class="a-icon a-icon-extender-expand"]').remove()
                                 productDetail          = lnc.getProductDetail($)
                                 productDetail.dataasin = dataasin
                                 productDetail.priceUrl = url
                                 productDetail.url      = `https://www.amazon.com/dp/${dataasin}/ref=twister_dp_update?psc=1&`
                                 chkvalid               = lnc.chkValidValue(productDetail)
                         if (chkvalid.status && !chkStatus){
                             console.log('detail success');
                             chkStatus = true
                             mg.setOnInsert('asin_detail',{dataasin:dataasin},{$set:productDetail})
                         }
                 }).catch(e => {
                   reciveRequest++
                   lnc.updateIpStatus(mg,proxy,0,1)
                   console.log('catch');
                 })
               }
               for (var i = 0; i < 1;) {
                 await delay(200)
                 console.log('maxReqeust : ',maxReqeust,' reciveRequest : ',reciveRequest);
                 if(maxReqeust <= reciveRequest || chkStatus){
                   i=2;
                  }
               }
              console.log('NEXT =============>');
          return {status:chkStatus,productDetail:productDetail}
}

async function setOnInsertAsinDetail(productDetail,price){
        productDetail.price = Number(price)
        console.log('set on insert price = ',price);
        await mg.setOnInsert('asin_detail',{dataasin:productDetail.dataasin},{$set:productDetail})
}

async function runAddItem(task){
        console.log(task,'task');
        let task_filter = await selectNotInAsin(task)
        console.log(task.length       ,' task now result');
        console.log(task_filter.length,' task_filter now result');

      ////////////////////////// set status /////////////////////////
      let chkStatus = {detail_task:false,price_task:false}
                                 await mg.emptyCollection('asin_price_task')
                                 await mg.emptyCollection('asin_detail_task')
          if(task.length)        await generateTaskByAsin('asin_price_task',task)
          if(task_filter.length) await generateTaskByAsin('asin_detail_task',task_filter)
          console.log('task',task);
          console.log('task_filter',task_filter);
          let detailTask;
          let asinTask;
      ////////////////////////// run task /////////////////////////
           await asin_item_price_task.run()
           await asin_detail_task.run()
      ////////////////////////// wait task /////////////////////////
      for (var i = 0; i < 1;) {
      if(!chkStatus.detail_task){
         detailTask = await mg.getData('asin_detail_task')
         chkStatus.detail_task = (detailTask.length > 0)? false : true
      }
      if(!chkStatus.price_task){
         asinTask = await mg.getData('asin_price_task')
         chkStatus.price_task   = (asinTask.length > 0)? false : true
      }
      console.log(chkStatus);
      if(chkStatus.price_task && chkStatus.detail_task)i += 10
        await delay(4010)
      }
      console.log('///////////////////===========> NEXT RUN ITEM');
     //////////////////////// run add item /////////////////////////
      await ebayAdd.add(mg,task)
      return true
}

async function runUpdateItem(asinItem,storeid){
      console.log('run item');
      // let maxReqeust = asinItem.length
      let maxReqeust = 0
      let reciveRequest = 0
      let callsend = 1
      let callsend_Max = 10
      let count_asinItem = asinItem.length

      for (k in asinItem) {
        try {
          await mg.insertCollection('asin_item',asinItem[k])
          await mg.insertCollection('asin_detail',asinItem[k])
        } catch (e) {
          console.log(e,'catch on : add asin_item');
        }
        console.log('ADD asin_item && asin_detail : DONE ',k,'/',count_asinItem);
        await delay(10)
      }

     console.log('DONE');
     return 1
}

async function generateTaskByAsin(taskTable,task){
              await mg.insertCollection(taskTable,task) // test
}
