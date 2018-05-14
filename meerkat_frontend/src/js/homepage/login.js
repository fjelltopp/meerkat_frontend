function login(loginURL, redirectURL){
//    if( !Cookies.get('meerkat_jwt') ){
        var loginbox = "<div class='row'><div class='login-box-holder'><div class='login box chartBox'><div class='chartBox__heading'>" + i18n.gettext('Login') + "</div><div class='chartBox__content' ><div id='login-form' class='login-form'><div class='form-group'></div><div class='form-group'><label>" + i18n.gettext('Username') + "</label><input type='text' class='text' name='username' /></div><div class='form-group'><label>" + i18n.gettext('Password') + "</label><input type='password' class='text' name='password' /></div><input type='submit' value='Login' class='submit login pull-right' /></div></div></div></div></div>";

        //Show the login html in a featherlight popup box.
        $.featherlight( loginbox, {variant:'loginBox'} );

        //Bind action to the login button
        $('input.submit.login').click( function(evt){
            evt.preventDefault();
            var formArray = {
                'username': $('input[name=username]').val(),
                'password': $('input[name=password]').val()
            };

            //Post json to server.
            $.ajax({
                url: loginURL,
                type: 'post',
                success: function (data) {
                    parent.location.replace( redirectURL );
                },
                error: function (data) {
                    console.log( data );
                    if( data.responseJSON.hasOwnProperty( 'message' ) ){
                        alert( data.responseJSON.message );
                    }else{
                        alert( i18n.gettext("There has been a server error. " +
                                            "Please contact administrator and try again later.") );
                    }
                },
                contentType: 'application/json;charset=UTF-8',
                data: JSON.stringify(formArray, null, '\t')
            });
        });

//    }else{
//        parent.location.replace( redirectURL );
//    }
}
