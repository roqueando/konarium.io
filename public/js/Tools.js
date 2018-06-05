class Request {

	post(url, data, callback) {


		$.ajax({

			url: url,
			type: "POST",
			dataType: 'json',
			data: data,
			success: (res) => {

				callback(res);

			},

			error: (err) => {
				
				callback(err);
			}

		});

	}

}

class Front {

	toast(txt) {
		// get the snackbar div from id
	    let element = document.getElementById("snackbar");

	    // add "show" class to DIV
	    element.className = "show";

	    element.innerHTML = txt;
	    // after 3 seconds, remove the show class from DIV
	    setTimeout(function() { 
	    	element.className = element.className.replace("show", ""); 
	    }, 3000);
	}

}