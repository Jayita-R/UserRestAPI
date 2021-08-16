var express = require("express");
var bodyParser = require("body-parser");
const mongoose = require('mongoose');
const url = require('url');


mongoose.connect('mongodb://localhost:27017/UserData');
var db = mongoose.connection;
db.on('error', console.log.bind(console, "connection error"));
db.once('open', function (callback) {
    console.log("Connection Succeeded");
})

var app = express();
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static(__dirname));


app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true
}));

var old_data;
var new_data;
app.post('/addUser', function (req, res) {

    var name = req.body.username;
    var age = req.body.age;

    var menuData = [{
        "name": name,
        "age": age,
    }];


    db.collection('userDetail').insertMany(menuData, function (err, collection) {
        if (err) throw err;
        console.log("Record inserted Successfully");
    });

    db.collection('userDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        return res.render('userlist.ejs', { data: dataObj });
    })
})

app.get('/addUser', function (req, res) {
    return res.render('addUser.ejs');
});

app.get('/delete/:name', function (req, res) {

    var deleteCriteria = { name: req.params.name }
    db.collection('userDetail').deleteOne(deleteCriteria, function (err, data) {
        if (err) throw err;
        console.log("User deleted successfully")
    });

    db.collection('userDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        res.redirect('..');
    })

})

app.get('/updateUser/:name', function (req, res) {

    db.collection('userDetail').findOne({ name: req.params.name }, function (err, dataObj) {
        console.log("Sending edited data to html page")
        console.log(dataObj);

        this.old_data = {
            name: req.params.name
        }

        return res.render('updateUser.ejs', { data: dataObj });
    })



})

app.post("/updateUser", function (req, res) {


    console.log(this.old_data)

    new_data = {

        name: req.body.username,
        age: req.body.age
    }

    console.log(new_data);

    db.collection('userDetail').updateOne({ name: this.old_data.name }, {
        $set: {

            name: req.body.username,
            age: req.body.age
        }
    }, function (err, dataObj) {
        console.log("Updating the data")
    })

    db.collection('userDetail').find().toArray(function (err, dataObj1) {
        console.log("Sending updated data to html page")
        res.redirect('..');

    })

})

app.get('/', function (req, res) {

    db.collection('userDetail').find().toArray(function (err, dataObj) {
        console.log("Sending data to html page")
        return res.render('userlist.ejs', { data: dataObj });
    })

})

app.listen(3000);
console.log('Server is listening on port 3000');