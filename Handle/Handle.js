const filesys = require("fs-extra");
const Watch = require("node-watch");
const Dat = require('dat-node');
const LowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

/**
 * ----------------------------------
 * 				Adapters 			|
 * ----------------------------------
 */
const Config = new FileSync('./config.json');
const Notices = new FileSync('./Notices/notices.json');

/**
 * ------------------------
 * 			DB's 		  |
 * ------------------------
 */

const ConfigDB = LowDB(Config);
const NoticesDB = LowDB(Notices);

/**
 * ------------------------------
 * 			DB's Defaults 		|
 * ------------------------------
 */

ConfigDB.defaults({

	id: "",
	user: {},
	konaries: []

}).write();


NoticesDB.defaults({

	notices: [],
	konars: []

}).write();

/**
 * Dat Handle Class
 */
class DatHandle {

	constructor(src) {


		Dat(src, (err, dat) => {
	        if(err) throw err;    

	        dat.importFiles();
  
	        dat.live;
	        dat.joinNetwork();
	        const hex_key = dat.key.toString('hex');
	        console.log(hex_key);

	    });

	}

	meet(hex, name) {

		ConfigDB.get('konaries')

				.push({

			        hex: hex,
			        name: file_name

	    		}).write();

	}

	sync() {

		let konaries = ConfigDB.get('konaries').value();



		filesys.readdirSync('./Konaries').forEach( (folder) => {
	           
	        filesys.readdirSync('./Konaries/'+folder).filter((json) => {

	            if(json.includes('.json')) {
	   
	                

	                Watch(`./Konaries/${folder}/notices.json`, {recursive: true}, (event, name) => {

	                    if(event == "update") {
	                        console.log("file: "+name+" updated");
	                        let str = folder.replace('_', ' ');
	                        
	                    }

	                    if(event == 'remove') {

	                        console.log("file: "+name+" removed");

	                        for(let friend in konaries) {

	                            // this.delivery(konaries[friend].hex, konariess[friend].name);
	                            
	                            console.log(konaries[friend].name); 
	                          
	                        }
	                        

	                    }

	                });

	            }
	        });
	           
	    });

	}

	delivery(hex, name) {

		Dat(`./Konaries/${name}`, {key: hex, sparse: true}, function (err, dat) {

	        dat.live;
	        dat.joinNetwork();

	        dat.archive.readFile(`/notices.json`, (err, content) => {
	            console.log(content);
	        });

	    });

	}
	

}



exports.DatHandle = DatHandle;
exports.ConfigDB = ConfigDB;
exports.NoticesDB = NoticesDB;