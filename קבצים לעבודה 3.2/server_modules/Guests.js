var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken'); // usined to create, sign, and verify tokens
var DButilsAzure = require('../DButils');
const superSecret = "edenANDhila"; // secret variable

//3
//localhost:3000/guests/categories
router.get('/categories', function (req, res) {
    DButilsAzure.execQuery(`select * from category`)
        .then((response) => {
            //console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
});
//end3

//4
function increaseViewsNum(pointID, viewsNum) {
    DButilsAzure.execQuery(`update points set viewsNum=` + (viewsNum + 1) + ` where pointID='` + pointID + `'`);
    console.log(`select viewsNum from points as p where p.pointID='` + pointID + `'`)
}
//localhost:3000/guests/pointInfo/1
router.get('/pointInfo/:pointID', function (req, res) {
    let pointID = req.params.pointID;
    let pointDetails;
    console.log(`select * from points as p where p.pointID='` + pointID + `'`)
    DButilsAzure.execQuery(`select * from points as p where p.pointID='` + pointID + `'`)
        .then(function (response) {
            pointDetails = response;
            increaseViewsNum(pointID, response[0].viewsNum);
        })
        .then(function (response) {
            DButilsAzure.execQuery(`select top 2 date, description from reviews where pointID='` + pointID + `' order by date desc`)
                .then(function (response) {
                    res.send({ point: pointDetails, reviews: response })
                })
        })
        .catch((err) => {
            console.log(err);
        })
});
//end4 

//5
//localhost:3000/guests/popPointInLoad/3
router.get('/popPointInLoad/:certainRate', function (req, res) {
    let certainRate = req.params.certainRate;
    let num= parseFloat(parseFloat(certainRate)*20);
    let query = `select p.pointID, p.name, p.rate, p.viewsNum, p.desription, c.categoryName from points as p join category as c on c.categoryID=p.categoryID where p.rate >`+num;
    console.log(query);
    DButilsAzure.execQuery(query)
        .then((response) => {
            jans = JSON.parse(JSON.stringify(response));
            if(jans.length>3){
                let rand1 = Math.floor(Math.random() * jans.length);
                let rand2 = Math.floor(Math.random() * jans.length);
                let rand3 = Math.floor(Math.random() * jans.length);
                while (rand1 === rand2) {
                    rand2 = Math.floor(Math.random() * jans.length);
                }
                while (rand1 === rand3 || rand2 === rand3) {
                    rand3 = Math.floor(Math.random() * jans.length);
                }
                let point_1=jans[rand1];
                let point_2=jans[rand2];
                let point_3=jans[rand3];

                    res.send({point_1,point_2,point_3});
            }
            else if (jans.length!=0)
            {
                res.send(jans);
            }
            else
            {
                res.send("no point to show");
            }
        })
        .catch((err) => {
            console.log(err);
        })
    //return the random points
});
//end5

//6
//localhost:3000/guests/register
router.post('/register', function (req, res) {
if (!req.body.userID || !req.body.password || !req.body.firstName || !req.body.lastName || !req.body.city || !req.body.email || 
        !req.body.que1 || !req.body.ans1 || !req.body.que2 || !req.body.ans2 || !req.body.country || 
        !req.body.cat1 || !req.body.cat2 || !req.body.cat3 || !req.body.cat4 ){
    
    res.send('Please fill all fields!');      
}
else {
    let userID = req.body.userID;
    let password = req.body.password;
    let firstName = req.body.firstName;
    let lastName = req.body.lastName;
    let city = req.body.city;
    let email = req.body.email;
    let que1 = req.body.que1;
    let ans1 = req.body.ans1;
    let que2 = req.body.que2;
    let ans2 = req.body.ans2;
    let country = req.body.country;

    let cat1 = req.body.cat1;
    let cat2 = req.body.cat2;
    let cat3 = req.body.cat3;
    let cat4 = req.body.cat4;

    let values = `('` + userID + `',` + `'` + password + `',` + `'` + firstName + `',` + `'` + lastName + `',` + `'` + city + `',` + `'` + email + `',` + `'` + que1 + `',` + `'` + ans1 + `',` + `'` + que2 + `',` + `'` + ans2 + `','` + country + `')`;
    let queryInsert = `INSERT INTO users (userID, password, firstName, lastName, city, email, que1, ans1, que2,ans2,country) VALUES ` + values;
    DButilsAzure.execQuery(queryInsert).then((response) => {
        console.log(queryInsert);


        if (cat1 === '1') {
            values = `('` + userID + `', '1')`;
            queryInsert = `INSERT INTO userCategories (userID, categoryID) VALUES` + values;
            DButilsAzure.execQuery(queryInsert);
        }
        if (cat2 === '1') {
            values = `('` + userID + `', '2')`;
            queryInsert = `INSERT INTO userCategories (userID, categoryID) VALUES` + values;
            DButilsAzure.execQuery(queryInsert);
        }
        if (cat3 === '1') {
            values = `('` + userID + `', '3')`;
            queryInsert = `INSERT INTO userCategories (userID, categoryID) VALUES` + values;
            DButilsAzure.execQuery(queryInsert);
        }
        if (cat4 === '1') {
            values = `('` + userID + `', '4')`;
            queryInsert = `INSERT INTO userCategories (userID, categoryID) VALUES` + values;
            DButilsAzure.execQuery(queryInsert);
        }
        res.send(true);
        //res.sendStatus(200)


    })
        .catch((err) => {
            console.log(err);
            res.send(queryInsert);
        })
}
});
//end6

//7
//localhost:3000/guests/restorePassword
router.post('/restorePassword', function (req, res) {
    let userID = req.body.userID;
    let securityAns1 = req.body.securityAns1;
    let securityAns2 = req.body.securityAns2;

    DButilsAzure.execQuery(`select ans1,ans2,password from users where userID='` + userID + `'`)
        .then((response) => {
            answers = JSON.parse(JSON.stringify(response));
            if (answers[0].ans1.localeCompare(securityAns1) == 0) {
                if (answers[0].ans2.localeCompare(securityAns2) == 0) {
                    res.send(answers[0].password);
                }
                else
                    res.send("you'r second answer is incorrect, try agin!");
            }
            else
                res.send("you'r first answer is incorrect, try agin!");
        })
        .catch((err) => {

            console.log(err);
        })
});
//end7

//8
//localhost:3000/guests/login
router.post('/login', function (req, res) {
    let userID = req.body.userID;
    let password = req.body.password;
    let token;
    if (!userID || !password)
        res.send({ message: "bad values" })
    else {
        DButilsAzure.execQuery(`select * from users where userID='`+userID+`'`)
        .then((response) => {
            jans = JSON.parse(JSON.stringify(response));
            if(jans[0].userID.localeCompare(userID)==0){
                if(jans[0].password.localeCompare(password)==0){
                    token=sendToken(userID);
                    // return the information including token as JSON
                    res.json({ success: true, token: token });
                }
                else{
                    res.send({ success: false, message: 'Authentication failed. Wrong Password' })
                    return
                }
            }   
            else
                res.send({ success: false, message: 'Authentication failed. No such user name' })    
            })
        .catch((err) => {
            console.log(err);
        })
    }
});

function sendToken(username, res) {
    var payload = {
        userName: username
    }

    var token = jwt.sign(payload, superSecret, {
        expiresIn: "1d" // expires in 24 hours
    });
    return token;
}

//11
//localhost:3000/guests/pointsAccCat/history
router.get('/pointsAccCat/:category', function (req, res) {
    let nameCat = req.params.category;
    //   let tourAttrID = req.params.tourAttrID;
    DButilsAzure.execQuery(`select p.pointID, p.name, p.rate, p.viewsNum, p.desription from points as p join category as c on c.categoryID=p.categoryID where c.categoryName='` + nameCat + `'`)
        .then((response) => {
            // console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })
    //return LIST of tourist attraction according category
});
//end11

//12
//localhost:3000/guests/points
router.get('/points', function (req, res) {
    DButilsAzure.execQuery(`select p.pointID, p.name, p.rate, p.viewsNum, p.desription, c.categoryName from points as p join category as c on c.categoryID=p.categoryID order by p.categoryID asc`)
        .then((response) => {
            console.log(response);
            res.send(response);
        })
        .catch((err) => {
            console.log(err);
        })    //return LIST of All tourist attraction divided into categories
});
//end12

//15
//localhost:3000/guests/securityQues
router.post('/securityQues', function (req, res) {
    let userID = req.body.userID;
    DButilsAzure.execQuery(`select s.que1, s.que2 from users as s where userID='` + userID + `'`)
    .then((response) => {
        res.send(response);
    })
    .catch((err) => {
        console.log(err);
    })
});
//end15
module.exports = router;