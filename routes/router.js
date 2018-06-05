const { app } = require('../server');
const path = require('path');
const { ConfigDB, DatHandle, NoticesDB } = require('../Handle/Handle');
const Dat = new DatHandle('./Notices');
Dat.sync();

app.get("/",  (req, res) => {


	let id = ConfigDB.get('id').value();
	let user = ConfigDB.get('user.name').value();

	
	
	try {

		let konaries = ConfigDB.get('konaries').value();
		
		console.log(konaries);

		for(let friend in konaries) {

			Dat.delivery(konaries[friend].hex, konaries[friend].name);

		}
		
		res.sendFile(path.join(__dirname, '../public', 'index.html'));
		
	}catch(err) {

		res.status(400).send({

			HOME_ERR: 'Error: ' + err

		});
	}
	
});


app.post("/meet", (req, res) => {

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

});

app.post("/publish", (req, res) => {

	const { title, media, content } = req.body;

	try {

		let user = ConfigDB.get('user').value();

		console.log(user);

		if(Object.keys(user).length === 0) {
			
			res.status(401).send({

				PUBLISH_ERR: 'Check your settings.'

			});

		}else {

			NoticesDB.get('notices')
			.push({
				title: title,
				author: user.name,
				media: media,
				content: content
			})
			.write();
			
			res.send({

				PUBLISH_SCCS: "Notice published!"

			});
		}

		

		

	}catch(err) {

		res.status(400).send({

			PUBLISH_ERR: "Error on: " + err

		});

	}
	

});