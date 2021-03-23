let express = require("express");
let router= express.Router();

function genToken() {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    let string_length = 16;
    let randomstring = '';
    for (let i=0; i<string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

let accounts =  {}
let tokens = {}

router.post("/login", function(req, res) {
    const username = req.body.user.toLowerCase();
    if(accounts.hasOwnProperty(username) && accounts[username].pass === req.body.pass) {
        const userToken = genToken();
        tokens[username].string = userToken; // set token
        tokens[username].life = Date.now()+3.6e6; //3600 second lifespan
        res.json({status: 111,
            user: accounts[username].user,
            string: userToken
        }); // success
        //res.json({name: accounts[username].user, token: userToken})
    } else if(!accounts.hasOwnProperty(username)) {
        res.json({status: 211}) // user does not exist
    } else {
        res.json({status: 212}) // incorrect password
    }
})

router.post("/create-account", function(req, res) {
    const username = req.body.user.toLowerCase();
    if(!accounts.hasOwnProperty(username)) {
        accounts[username] = req.body;
        tokens[username] = {string: "", life: 0} // initialize token object (so checks don't cause errors)
        res.json({
            status: 121,
            user: accounts[username].user
        }); // success
    } else {
        res.json({status: 221}); // user exists
    }
})

router.post("/check-token", function(req, res) {
    const username = req.body.user.toLowerCase();
    if(tokens[username].string === req.body.string && tokens[username].life > Date.now()) {
        res.json({
            status: 131,
            user: accounts[username].user
        }); // success
    } else if(tokens[username].life < Date.now()) {
        res.json({
            status: 231,
        }); // session expired
    } else {
        res.json({
            status: 232,
            receivedString: JSON.stringify(req.body),
            expectedString: tokens[username].string
        }); // invalid login token (server restart? or bugs)
    }
})

router.post("/logout", function(req, res) {
    const username = req.body.user.toLowerCase();
    if(tokens[username].string === req.body.string) { //must check token so fraudulent requests can't log out random people
        tokens[username] = {string: "", life: 0}
        res.json({
            status: 141
        }) // success
    } else {
        res.json({
            status: 241,
            received: JSON.stringify(req.body)
        }) // invalid token (so i guess you're already logged out?)
    }
})

module.exports = router;