let express = require("express");
let router = express.Router();
const base = 'https://barbank.diarainfra.com';

function send(res, source, method, path, data, token) {
    const fetch = process.browser ? window.fetch : require('node-fetch').default;

    const opts = { method, headers: {}};

    if (data) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(data);
    }

    if (token) {
        opts.headers['Authorization'] = 'Bearer '+token;
    }
    fetch(base+"/"+path, opts)
        .then(r => r.text())
        .then(json => Object.defineProperty(JSON.parse(json), 'source', {'value': source, enumerable: true}))
        .then(json => res.send(json))
}

router.post("/login", function(req, res) {
    send(res, 'login', 'POST', 'sessions', {
        "username": req.body.user,
        "password": req.body.pass
    })
})

router.post("/create-account", function(req, res) {
    send(res, 'create-account', 'POST', 'users', {
        "name": req.body.name,
        "username": req.body.user,
        "password": req.body.pass
    })
})

router.post("/check-token", function(req, res) {
    send(res, 'check-token', 'GET', 'users/current', undefined, req.body.token);
})

router.post("/logout", function(req, res) {

})

module.exports = router;