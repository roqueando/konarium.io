
const express = require('express');
const router = express.Router(); // Initialize the Express Router

// get all I need from Handle file
const { ConfigDB, DatHandle, NoticesDB } = require('../Handle');

/**
 * --------------------------
 * 							|
 * 		CONTROLLERS 		|
 *   						|
 * --------------------------
 */
const userController = require('../controllers/userController');
const homeController = require('../controllers/homeController');

// Initialize the Dat importing the Notices folder
const Dat = new DatHandle('./Notices');

// Init the sync
Dat.sync();

/**
 * --------------------------
 * 							|
 * 			Index '/'		|
 * 							|
 * --------------------------
 *
 * That is going to get your 
 * config.json and your konaries (friends)
 * and check if have konaries, for each konar that
 * will make a delivery, getting the files to respective folders
 * and making the sync continuous. 
 * Finally that will be render the home
 */
router.get("/",  (req, res) => {


	let id = ConfigDB.get('id').value();
	let user = ConfigDB.get('user.name').value();
	let me = ConfigDB.get("user").value();
	

	let konaries = ConfigDB.get('konaries').value();
		
	
	if(konaries && konaries.length > 0) {
		for(let friend in konaries) {

			Dat.delivery(konaries[friend].hex, konaries[friend].name);

		}
	}
	
		
	res.send({
		user: me
	});

});


/**
 * ------------------------------
 * 			USER ROUTES			|
 * 		 userController.*		|
 * ------------------------------
 */

router.post("/meet", userController.meet);

router.post("/publish", userController.publish);

router.post("/replyto", userController.replyto);

router.put('/edit', userController.edit);


/**
 * ------------------------------
 * 			HOME ROUTES			|
 * 		homeController.*			|
 * ------------------------------
 */
router.get("/notices", homeController.notices);

router.post("/replies", homeController.replies);


//Exports the app and use the prefix '/'
module.exports = app => app.use('/', router);