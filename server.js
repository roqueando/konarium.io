const express = require('express');
const app = express();
const Handle = require('./Handle');
const bp = require('body-parser');
const path = require('path');
const { ConfigDB, NoticesDB } = require('./Handle');

/**
 * --------------------
 *  	App uses 	  |
 * --------------------
 */
app.use(bp.urlencoded({limit: '50mb', extended: true}));
app.use(bp.json());





// Exports the Application
exports.app = app;

/**
 * ----------------------
 * 		Requires 		|
 * ----------------------
 */
 require("./routes/router")(app);

/**
 * Server Starts
 * @param  Int 8000 Port which server will listen
 */
app.listen(8000, () => {

	console.log('Server on 8000');

});

