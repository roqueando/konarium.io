
/**
 *-----------------------
 *						|
 * 		REQUIRES LIST 	|
 *   					|
 * ----------------------
 *
 * @param filesys require the fs-extra module
 *                which get all base functions
 *                of fs module with more extra
 *                options
 * 
 * @param Watch   require the node-watch module
 *                which creates a Watcher on a folder
 *                or file.
 *
 * @param Dat     require the dat-node module which
 *                creates a hyperdrive archive to
 *                import, share and downloads files
 *                on Dat Network
 *
 * @param LowDB   require the lowdb module which is
 *                the "JSON-DB-based" handler
 *
 * @param FileSync require the Adapters to synchronize files
 *                 with lowdb handler
 */
const filesys = require("fs-extra");
const Watch = require("node-watch");
const Dat = require('dat-node');
const LowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');


/**
 * ----------------------------------
 * 				Adapters 			|
 * ----------------------------------
 *
 * @param Config 	initialize a new adapter 
 *                  on config.json
 *                  
 * @param Notices 	initialize a new adapter
 *                  on notices.json
 */
const Config = new FileSync('./config.json');
const Notices = new FileSync('./Notices/notices.json');

/**
 * ------------------------
 * 			DB's 		  |
 * ------------------------
 *
 * @param ConfigDB 	Initialize a handler 
 *                  with LowDB on Config Adapter
 *
 * @param NoticesDB Initialize a handler
 *                  with LowDB on Notices Adapter
 */

const ConfigDB = LowDB(Config);
const NoticesDB = LowDB(Notices);

/**
 * ------------------------------
 * 			DB's Defaults 		|
 * ------------------------------
 *
 * @description 	Set up the default keys
 *              and values of these DB's
 */

ConfigDB.defaults({
	
	user: {},
	konaries: []

}).write();


NoticesDB.defaults({

	notices: [],
	konars: []

}).write();

/**
 *---------------------------
 *		Dat Handle Class 	|
 *---------------------------
 *
 * @class DatHandle
 * @constructor src Is the path of the folder 
 *              	which will be imported
 */
class DatHandle {

	constructor(src) {

		this.key;

		Dat(src, (err, dat) => {
	        if(err) throw err;    

	        dat.importFiles();
  			
  			const watcher = Watch(`./Notices/notices.json`, {recursive: true});

  			watcher.on('change', (event, name) => {
  				console.log("The file " + name + " has changed");

  				dat.importFiles();
  			})
	        dat.live;
	        dat.joinNetwork();
	        this.key = dat.key.toString('hex');
	        console.log(this.key);

	    });

	}


	/**
	 * Sync method
	 * @description create a continuos sync of files
	 *              and folders searching for changes on a 
	 *              specific file or folder.
	 */
	sync() {

		let konaries = ConfigDB.get('konaries').value();



		filesys.readdirSync('./Konaries').forEach( (folder) => {
	           
	        filesys.readdirSync('./Konaries/'+folder).filter((json) => {

	            if(json.includes('.json')) {
	   
	                let konar = filesys.readJsonSync(`./Konaries/${folder}/notices.json`, 'utf-8');
	                let mykonarid = NoticesDB.get('konars').map('id').value();
	             	
	             	for(var n in konar.notices) {

	             		if(mykonarid[n] == konar.notices[n].id) {

	             			console.log("equal");

	             		}else {

	             			NoticesDB.get('konars')
	             					.push(konar.notices[n])
	             					.write();
	             		}

	             	}
	                
	                Watch(`./Konaries/${folder}/notices.json`, {recursive: true}, (event, name) => {
	                	
	                    if(event == "update") {
	                        console.log("file: "+name+" updated");
	                        
	                    }

	                    if(event == 'remove') {

	                        console.log("file: "+name+" removed");

	                        for(let friend in konaries) {

	                            
	                            this.delivery(konaries[friend].hex, konaries[friend].name);
	                            
	                            console.log(konaries[friend].name); 
	                          
	                        }
	                        

	                    }

	                });

	            }
	        });
	           
	    });

	}


	/**
	 * Delivery method
	 * @param  {String} hex  Hash of the user which 
	 *                       you want to delivery these files
	 *                       
	 * @param  {String} name Name of the user which 
	 *                       you want to delivery
	 *
	 * @description Make a delivery by user and hash and 
	 *              download the content.
	 *              This will make a "combo" with the sync method,
	 *              because this will be called again all time if the
	 *              konar make a change
	 */
	delivery(hex, name) {

		Dat(`./Konaries/${name}`, {key: hex, sparse: true}, function (err, dat) {

	        dat.live;
	        dat.joinNetwork();

	        dat.archive.readFile(`/notices.json`, (err, content) => {
	            console.log(content);
	        });

	    });

	}
	
	getMyHash() {

		return this.key;
	}
}


/**
 * -----------------------
 * 		Post Class 		 |
 * -----------------------
 */
class Post {

	constructor() {

		this.NoticesDB = NoticesDB;
		this.ConfigDB = ConfigDB;

	}

	/**
	 * Publish method
	 * 
	 * @param  {Object} data      An object will contain all info
	 *                            getted by request
	 *                            
	 * @param  {String} author    A string with the name of the author
	 * 
	 * @param  {String} timestamp A string with the full date which the
	 *                            notice has published
	 *
	 * @description Create a new notice and append on notices
	 *              file. 
	 */
	create(data = {}, author = "", timestamp = "") {

		
		this.NoticesDB.get('notices')
				.push({
					id: `_${Math.random().toString(36).substr(2, 9)}`,
					title: data.title,
					author: author,
					media: data.media,
					content: data.content,
					timestamp: timestamp,
					replies: []
				})
				.write();

	}


	/**
	 * Reply method
	 * @param  {String} id Notice's Id
	 * @return {Object} reply   The object of reply was created
	 *
	 * @description That will get all info from request body
 	 *              and place on a notice with the id passed by
 	 *              request body.
	 */
	reply(id, data) {

		let notices = NoticesDB.get('notices').value();
		let konars = NoticesDB.get('konars').value();
		
		let reply;

		for(var n in notices) {
			
			
			if(id == notices[n].id) {


				reply = NoticesDB.get(`notices[${n}].replies`)
								.push({
									id: `_${Math.random().toString(36).substr(2, 9)}`,
									reply: data.reply,
									r_media: data.r_media
								})
								.write();

				break;
				

			}else if(id == konars[n].id){

				reply = NoticesDB.get(`konars[${n}].replies`)
								.push({
									id: `_${Math.random().toString(36).substr(2, 9)}`,
									reply: data.reply,
									r_media: data.r_media
								})
								.write();

				break;
			}
		}

		return reply;
	
	}

	getReplies(id) {

		let replies;
		let notices = NoticesDB.get('notices').value();
		let konars = NoticesDB.get('konars').value();

		for(var n in notices) {

			if(id == notices[n].id) {
				
				replies = NoticesDB.get(`notices[${n}].replies`)
								.value();
				break;
				

			}else if(id == konars[n].id) {

				replies = NoticesDB.get(`konars[${n}].replies`)
								.value();

				break;
			}
		}
		
		return replies;

	}

	getNotices() {

		let notices = NoticesDB.get('notices')
								.value();
		let konars = NoticesDB.get('konars')
								.value();

		let all = notices.concat(konars);

		return all;

	}
}

class User {

	meet(name, hex) {

		ConfigDB.get('konaries')
				.push({
					name: name,
					hex: hex
				})
				.write();

	}

	edit(name, avatar) {

		ConfigDB.set('user.name', name)
				.set('user.avatar', avatar)
				.write();

	}
}

/**
 *-----------------------
 * 		EXPORTS 		|
 *-----------------------
 *
 * @param DatHandle export DatHandle Class
 *
 * @param ConfigDB export lowdb's ConfigDB
 *
 * @param NoticesDB export lowdb's NoticesDB
 *
 * @param Post export Post Class
 *
 * @param User export User Class
 */
exports.DatHandle = DatHandle;
exports.ConfigDB = ConfigDB;
exports.NoticesDB = NoticesDB;
exports.Post = Post;
exports.User = User;