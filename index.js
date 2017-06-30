// const jsonfile = require('jsonfile')

// Include remote for main.js
// const remote = require('electron').remote
// const main = remote.require('./main.js')

// var file2 = 'data.json'
// var link

$( document ).ready(function() {
	$.getJSON("data.json", function(result){
		var audio = $("#dingdong")[0];
		var items = [];
        $.each(result, function(i, studio){
             // console.log(studio.studioName);
             items.push( "<li><a id='"+i+"' href='#' onclick='return false;'>" + studio.studioName + "</a></li>" );
        });
        $( "<ul/>", {
		    html: items.join( "" )
		}).appendTo( "#studios" );
		$('a').click(function(event){
			// alert(event.target.id);
			var clickID = event.target.id;
			audio.play();
			$.ajax({
				type: "GET",
				url: "req",
				data: {id: clickID},
				success:function(data){
					console.log(data);
				},
				error: function(err){
					// alert(JSON.stringify(err));
					console.log("error", err);
				}
			})
		});
	});
});

