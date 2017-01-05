var language = 'en';

function get_translator(translations_url){

	if(language === undefined){
		var langauge = "en";
	}
    if(translations_url === undefined){
        translations_url = "/static/translations/"+language+"/LC_MESSAGES/messages.json";
    }

	console.log( language );
    console.log( "Translations from: " );
    console.log( translations_url );

	if(language !== undefined && language != "en"){

		$.ajax({
			dataType: "json",
			async: false,
			url: translations_url,
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
