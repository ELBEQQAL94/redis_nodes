// DEPENDENCIES
const express = require('express');
const expresshbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

// create Redis client
let client = redis.createClient();

// Run Redis
client.on(
    'connect', 
    () => console.log('Connect to redis...'))

// SET PORT
const port = 8000;

// Init App
const app = express();

// View Engine
app.engine('handlebars', expresshbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// method override (client request)
app.use(methodOverride("_method"));

app.get('/', (req, res, next) => {
    res.render('searchusers');
});

app.post('/user/search', (req, res) => {
    let id = req.body.id;

    client.hgetall(id, (err, object) => {
         if(!object){
             res.render('searchusers', {
                 error: 'User does not exist!'
             });
         } else {
             object.id = id;
             res.render('details', {
                 user: object
             });
         }
    });

});

app.get('/user/add', (req, res) => {
    res.render('adduser');
});

app.post('/user/add', (req, res) => {
    let {id, first_name, last_name, email} = req.body;

    console.log(req.body);

    client.hmset(id, [
        'first_name', first_name,
        'last_name', last_name,
        'email', email
    ], (err, result) => {
        if(err) console.log(err);
        console.log(result);
        res.redirect('/');
    })

});

app.delete('/user/delete/:id', (req, res) => {
    let id = req.params.id;

    client.del(id);

    res.redirect('/');

});

app.listen(port, () => console.log(`Server running at ${port} port...`))