var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // usined to create, sign, and verify tokens
var DButilsAzure = require('../DButils');
const superSecret = "edenANDhila"; // secret variable
//1
//localhost:3000/auth/users/favPoints
router.get('/favPoints', function (req, res) {
    let token= req.decoded;
    //console.log(token);   
    let userID = token.userName;
    DButilsAzure.execQuery(`select p.pointID, p.name, p.rate, p.viewsNum, p.desription from points as p join favorites as f on f.pointID=p.pointID where f.userID='` + userID + `'`)
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => { console.log(err); })
    // res.send(userID);
});

//2
//localhost:3000/auth/users/review
router.post('/review', function (req, res) {
    let pointID = req.body.pointID;
    let token= req.decoded;
    //console.log(token);   
    let userID = token.userName;
    let review = req.body.review;


    var values = `(CAST((GETDATE()) AS DATE),'` + pointID + `','` + review + `','` + userID + `')`;
    var query = `INSERT INTO reviews (date,pointID, description, userID) VALUES` + values;

    DButilsAzure.execQuery(query).then((response) => {
        //  console.log(response);
        res.send(true);
    }).catch((err) => {
        // console.log(err);
        res.send(false);
    })
    //res.send(query);
});
//end2


//9
//localhost:3000/auth/users/2popularPoints
router.get('/2popularPoints', function (req, res) {
    let token= req.decoded;
    //console.log(token);   
    let userID = token.userName;
    let cat_1, cat_2;
    let query=`select  p1.categoryName, p1.name, p1.pointID , p1.rate ,p1.categoryID 
                from (select p.*, c.categoryName from points as p join category as c on c.categoryID=p.categoryID) as p1
                inner join
                (select categoryID, MAX(rate) as MaxRate
                from points
                group by categoryID) as m 
                on p1.categoryID = m.categoryID
                and p1.rate = m.MaxRate where p1.categoryID=`
    DButilsAzure.execQuery(`select categoryID from userCategories where userID='`+userID+`'`)
        .then((response)=>{
            jans = JSON.parse(JSON.stringify(response));
            if(jans.length>1){
                let rand1 = Math.floor(Math.random() * jans.length);
                let rand2 = Math.floor(Math.random() * jans.length); 
                while (rand1 === rand2 || jans[rand1].categoryID.localeCompare(jans[rand2].categoryID)==0){
                    rand2 = Math.floor(Math.random() * jans.length);
                }
                cat_1=jans[rand1].categoryID;
                cat_2=jans[rand2].categoryID;
                DButilsAzure.execQuery(query+cat_1+`or p1.categoryID=`+cat_2)
                .then((response)=>{
                    res.send({points:response})
                })
            }
            else if(jans.length!=0){
                cat_1=jans[rand1].categoryID;
                DButilsAzure.execQuery(query+cat_1)
                .then((response)=>{
                    res.send({points:response})
                })
            }
            else{
                res.send("No point to show");
            }
        })
        .catch((err) => {
            console.log(err);
        })
    //return LIST of 2 popular Tourist Attractions according to userID, category[] that the user interested in the registration
});
//end9

//10
//localhost:3000/auth/users/2favPoinots
router.get('/2favPoinots', function (req, res) {
    let token= req.decoded;
    //console.log(token);   
    let userID = token.userName;
    let queryCount;
    DButilsAzure.execQuery(`select count(pointID) numOfFav from favorites where userID='` + userID + `'`)
        .then((response) => {
            ans = JSON.parse(JSON.stringify(response));
            queryCount = ans[0].numOfFav;
            console.log(queryCount);
            if (queryCount > 0) {
                DButilsAzure.execQuery(`select top 2 p.pointID, p.name, p.rate, p.viewsNum, p.desription from favorites as f join points as p on p.pointID=f.pointID where userID='` + userID + `' order by f.date desc`)
                    .then((response) => {
                        console.log(response);
                        res.send(response);
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            }
            else
                res.send("There are no points of interest in favorites");
        })
    //return 2 last saved points of interest of the userID from the favorites
});
//end10

//13
//localhost:3000/auth/users/pointAsFav
router.post('/pointAsFav', function (req, res) {
    let token= req.decoded;
    //console.log(token);   
    let userID = token.userName;
    let pointID = req.body.pointID;
    let queryCount = `SELECT COUNT(pointID) FROM favorites WHERE userID='` + userID + `'`;
    let numberOffavAccUserID;
    let values = `(CAST((GETDATE()) AS DATE),'` + userID + `','` + pointID + `')`;
    let queryInsert = `INSERT INTO favorites (date, userID, pointID) VALUES` + values;
    DButilsAzure.execQuery(queryInsert)
        .then((response)=>{
            DButilsAzure.execQuery(queryCount)
            .then((response) => {
                ans = JSON.parse(JSON.stringify(response));
                numberOffavAccUserID = ans[0][''];
                res.send(""+numberOffavAccUserID+"");
            })
            .catch((err) => {
                console.log(err);
            })
        })
            
});
//end13



//14
//localhost:3000/users/pointAsFav/7
router.delete('/pointAsFav/:pointID', function (req, res) {
    let token= req.decoded;  
    let userID = token.userName;
    let pointID = req.params.pointID;
    let queryCount = `SELECT COUNT(pointID) FROM favorites WHERE userID='` + userID + `'`;
    let numberOffavAccUserID;
    let queryDelete = `DELETE FROM favorites WHERE userID='` + userID + `' AND pointID='` + pointID + `'`;
    DButilsAzure.execQuery(queryDelete)
    .then((response)=>{
        DButilsAzure.execQuery(queryCount)
        .then((response) => {
            ans = JSON.parse(JSON.stringify(response));
            numberOffavAccUserID = ans[0][''];
            res.send(""+numberOffavAccUserID+"");
    })
    .catch((err) => {
        console.log(err);
    })
    })
});
//end14

//16
//localhost:3000/auth/users/ratePoint
router.post('/ratePoint', function (req, res) {
    let newRate = req.body.rate;
    let pointID = req.body.pointID;

    let query = `select * from points where pointID = '` + pointID + `'`
    DButilsAzure.execQuery(query)
        .then((response) => {
            newRate = newRate * 20;// *100/5

            jans = JSON.parse(JSON.stringify(response));
            let rateFromTbl = jans[0].rate;
            let numberOfRate = jans[0].numRate;

            let sumOfRate = parseFloat(parseFloat(numberOfRate) * parseFloat(rateFromTbl));
            sumOfRate = sumOfRate + newRate;
            numberOfRate = numberOfRate + 1;
            let avg = sumOfRate / (numberOfRate);

            DButilsAzure.execQuery(`update points set rate=` + (avg) + ` where pointID='` + pointID + `'`);
            DButilsAzure.execQuery(`update points set numRate=` + (numberOfRate) + ` where pointID='` + pointID + `'`);

            res.send(true);
        })
        .catch((err) => {
            res.send(false);
            console.log(err);
        })
});

module.exports = router;