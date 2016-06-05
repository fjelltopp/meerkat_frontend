
function get_translator(){

	if(language === undefined){
		var langauge = "en";
	}
	
	
	console.log(language);
	if(language !== undefined && language != "en"){

		$.ajax({
			dataType: "json",
			async: false,
			url: "/static/translations/"+language+"/LC_MESSAGES/messages.json",
			success: function(translation) {
				translator = new Jed(translation);
			}
			});
	}else{
		translator = new Jed( {
			locale_data : {
				"messages" : {
					"" : {
						"domain" : "messages",
						"lang"   : "en",
						"plural_forms" : "nplurals=2; plural=(n != 1);"
					}
				}
			},
			"domain" : "messages"
		});
	}
	console.log(translator);
	return translator;
}
var i18n = get_translator();
