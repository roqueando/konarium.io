const req = new Request();
const FrontEnd = new Front();
$("#k-person").keyup(event => {

	if(event.which == 13) {

		let text = $("#k-person").val();

		let splitted = text.split('@');

		const [ name, hex ] = splitted;

		let Response = req.post('/meet', {
			name: name.replace(' ', '_'),
			hex: hex
		});

		console.log(Response);

		$("#k-person").val('');
	}

});


$("#publish-form").submit(event => {

	event.preventDefault();

	req.post('/publish', {
		title: $("#n-title").val(),
		media: '',
		content: $("#n-content").val()
	}, response => {

		if(response.status == 401) {

			FrontEnd.toast(response.responseJSON.PUBLISH_ERR);

		}else if (response.status == 200) {

			FrontEnd.toast("Notice Published");

		}



	});

});

$("#setting").click(event => {

	event.preventDefault();

	

})