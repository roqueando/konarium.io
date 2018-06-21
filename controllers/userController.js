const { ConfigDB, NoticesDB, Post } = require('../Handle');
const PostHandler = new Post();
/**
 * FormatAMPM 
 * @param  {String} date 
 * @return {String} strTime    
 * @description That will check if the date passed by
 *              arguments will be AM or PM
 */
function formatAMPM(date) {

  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  minutes = minutes < 10 ? '0'+minutes : minutes;

  var strTime = hours + ':' + minutes + ' ' + ampm;
  
  return strTime;

}


/**
 * --------------------------
 * 							|
 * 		Meet Endpoint		|
 *   	POST /meet 	 		|
 *    						|
 * --------------------------
 * @param  {HTTP Request} req Request's body
 * @param  {HTTP Response} res Response
 * @return {JSON}
 * @description 	That will get the name and hash key from request
 *              and will put on your konaries in config.json
 *
 */
module.exports.meet = (req, res) => {

	const { name, hex } = req.body;

	try {

		ConfigDB.get('konaries')
				.push({
					name: name,
					hex: hex
				})
				.write();

		res.send({

			MEET_SCCS: "Connected to a Konarium"

		});


	}catch(err) {

		res.status(400).send({

			MEET_ERROR: "Error on: "+err

		});

	}

}


/**
 * --------------------------
 * 							|
 * 		Publish Endpoint		|
 *   	POST /pusblish 		|
 *    						|
 * --------------------------
 * @param  {HTTP Request} req Request's body
 * @param  {HTTP Response} res Response
 * @return {JSON}
 * @description That will get all info from request body
 *              and put into notices.json on your notices
 */
module.exports.publish = (req, res) => {

	const { title, media, content } = req.body;

	try {

		let user = ConfigDB.get('user').value();
		let date = new Date();
		let date_str = `${date.getFullYear()}/${date.getMonth()}/${date.getDay()}`;
		

		if(Object.keys(user).length === 0) {
			
			res.status(401).send({

				PUBLISH_ERR: 'Check your settings.'

			});

		} else {

			let timestamp = `${date_str} at ${formatAMPM(date)}`;

			

			PostHandler.create({

				title: title,
				author: user.name,
				media: media,
				content: content,
				timestamp: timestamp

			});
			
			res.send({

				PUBLISH_SCCS: "Notice published!"

			});
		}

	}catch(err) {

		res.status(400).send({

			PUBLISH_ERR: "Error on: " + err

		});

	}

}


/**
 * --------------------------
 * 							|
 * 		ReplyTo Endpoint		|
 *   	POST /replyto 		|
 *    						|
 * --------------------------
 * @param  {HTTP Request} req Request's body
 * @param  {HTTP Response} res Response
 * @return {JSON}
 * @description That will get all info from request body
 *              and place on a notice with the id passed by
 *              request body.
 */
module.exports.replyto = (req, res) => {

	try {

		const { notice_id, reply, r_media } = req.body;

		let rply = PostHandler.reply(notice_id, {reply: reply, r_media: r_media});
		
		
		res.send({

			REPLYTO_SCCS: rply
		});
		

	}catch(err) {

		if(err) throw err;
		res.status(400).send({

			REPLYTO_ERR: 'Error on: ' + err

		});

	}

}


/**
 * --------------------------
 * 							|
 * 		Edit Endpoint		|
 *   	PUT /edit 	 		|
 *    						|
 * --------------------------
 * @param  {HTTP Request} req Request's body
 * @param  {HTTP Response} res Response
 * @return {JSON}
 * @description That will get all info which the user
 *              has placed and will update yourself
 *              on the config.json.
 *              
 */
module.exports.edit = (req, res) => {

	try {

		const { name, from, about } = req.body;

		ConfigDB.set('user.name', name)
				.set('user.from', from)
				.set('user.about', about)
				.write();

		res.send({

			EDIT_SCCS: 'User Modified'
		});


	}catch(err) {

		res.status(400).send({

			EDIT_ERR: 'Error on: ' + err
		});

	}

}