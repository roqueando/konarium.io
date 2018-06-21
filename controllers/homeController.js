const { ConfigDB, NoticesDB, Post } = require('../Handle');
const PostHandler = new Post();

/**
 * --------------------------
 * 							|
 * 		Notices Endpoint		|
 *   	GET /notices 		|
 *    						|
 * --------------------------
 * @param  {HTTP Request} req Body of request
 * @param  {HTTP Response} res Response
 * @return {JSON}     
 */
module.exports.notices = (req, res) => {

	try {

		let all = PostHandler.getNotices();

		res.send({
			all
		});

	}catch(err) {

		res.status(400).send({

			NOTICES_ERR: 'Error on: ' + err

		});

	}

}

/**
 * --------------------------
 * 							|
 * 		Replies Endpoint		|
 *   	POST /replies 		|
 *    						|
 * --------------------------
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
module.exports.replies = (req, res) => {

	try {


		var { id } = req.body;

		var replies = PostHandler.getReplies(id);
		
		console.log(replies);

		if(replies.join().replace(/,/g,'').length === 0) {
			console.log('Replies are null');
			res.send({
				replies: 0
			});
		} else {

			res.send({
				
				replies

			});
		}
		

	}catch(err) {

		res.status(400).send({

			REPLIES_ERR: 'Error on: ' + err

		});
	}

}