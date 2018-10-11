
function getTopics(topics){
    var ret = {'topics': [], 'locID': 1};
    for( var t in topics){
      var parts = String(topics[t]).split('-');
      ret.topics.push(parts[parts.length-1]);
      if( parts.length == 3 ) ret.locID = parseInt(parts[1]);
    }
    return ret;
}

/**:drawForm(subscriber)
 *
 * Draws and populates the subscribe form.
 */
function drawForm(subscriber){

  //Default value for subscriber
  if(subscriber == null){
    subscriber = {
      "country": "",
      "email": "",
      "first_name": "",
      "id": "",
      "last_name": "",
      "sms": "",
      "topics": [],
    };
  }else{
    $('#subscribe-form input.submit').val(i18n.gettext('Update'));
  }

	//Draw the dynamic elements of the form.
	$.getJSON( api_root+"/variables/alert?include_group_b=1", function( variables ){
		$.getJSON( api_root+"/locationtree", function( locations ){

			//Draw the disease Selector
			var disSel ="<div class='title  row'>" + i18n.gettext('Select which Alerts to receive:') + "</div>";

			disSel += "";
			disSel += "<div class='row'>";
			disSel += "<div class='col-xs-12 col-sm-6 check'>";
			disSel += "<input id='all-diseases' type='checkbox' value='allDis' name='topics'";
			disSel += "onclick='toggleAll(this); checkSelected(this);'>" + i18n.gettext('All Alerts') + "</div> ";

      var keys = Object.keys(variables);

			for( var i in keys ){
				disSel += "<div class='col-xs-12 col-sm-6 check'>";
				disSel += "<input type='checkbox' class='disease' name='topics'";
	         disSel += "onclick='checkSelected(this)' value='" + keys[i] + "'>";
				disSel += i18n.gettext(variables[keys[i]].name) + "</div>";
			}
			disSel += "</div>";
			$('#disease-select').html(disSel);

			//Draw the report selector
			var repSel = "<div class='title'>" + i18n.gettext('Select which Reports to receive:') + "</div>";
			for( var j in config.subscribe.reports ){
				repSel += "<div class='col-xs-12 col-sm-8 col-sm-offset-4 check'>";
				repSel += "<input type='checkbox' onclick='checkSelected(this);' class='reports'";
				repSel += "name='topics' value='" + config.subscribe.reports[j].id + "'>";
				repSel += i18n.gettext(config.subscribe.reports[j].name) + "</div>";
			}
			$('#report-select').html(repSel);


      // Populate the personal information if it exists.
      console.log(subscriber);
      $("#subscribe-form input[name='id']").val(subscriber.id);
      $("#subscribe-form input[name='first_name']").val(subscriber.first_name);
      $("#subscribe-form input[name='last_name']").val(subscriber.last_name);
      $("#email").val(subscriber.email);
      $("#email2").val(subscriber.email);
      if( subscriber.sms ) $('#sms-number').intlTelInput("setNumber", subscriber.sms);
      var data = getTopics(subscriber.topics);
      loadLocation(data.locID);
      for( var t in data.topics ){
        $("#subscribe-form input[name='topics'][value='" + data.topics[t] + "']").prop('checked', true);
        if( data.topics[t] === "allDis" ) toggleAll(document.getElementById('all-diseases'));
      }

		});
	});
}

/**:drawSubscriberTable()
 *
 * A function that draws the table of subscribers for the subscriber manager.
 * It does this using bootstrap-table, a third party dependancy, collecting data
 * from the /subscribers/get_subscribers resource.
*/
function drawSubscriberTable(){
    $.getJSON(api_root+"/variables/alert?include_group_b=1", function(variables){
        //Define the table structure
        var columns = [{
                'field': 'state',
                'checkbox': true,
                'align': 'center',
                'valign': 'middle'
            },{
                'field': "first_name",
                'title': i18n.gettext('First Name'),
                'align': "left",
                'class': "header",
                'sortable': true,
                'width': "20%"
            },{
                'field': "last_name",
                'title': i18n.gettext('Last Name'),
                'align': "left",
                'class': "header",
                'sortable': true,
                'width': "20%"
            },{
                'field': "email",
                'title': i18n.gettext('Email'),
                'align': "left",
                'class': "header",
                'sortable': true,
                'width': "20%"
            },{
                'field': "sms",
                'title': i18n.gettext('SMS'),
                'align': "left",
                'class': "header",
                'sortable': true,
                'width': "20%"
            },{
                'field': "verified",
                'title': i18n.gettext('Verified?'),
                'align': "left",
                'class': "header",
                'sortable': true,
                'width': "20%"
            },{
                'field': "topicStrings",
                'title': i18n.gettext('Topics'),
                'visible': false,
                'searchable': true
            }
        ];

        var tmp = '/en/messaging/get_subscribers';

        for(var r in config.subscribe.reports){
            var report = config.subscribe.reports[r];
            variables[report.id] = report;
        }
        variables.allDis = {'name': i18n.gettext('All Alerts')};

        //A function that prepares the data for displaying in the table.
        function prepData(res){
            for(var s in res.rows){
                var topics = getTopics(res.rows[s].topics).topics;
                res.rows[s].topicStrings = topics.map(function(topic){
                    return i18n.gettext(variables[topic].name) || topic;
                }).join(', ');
            }
            return res.rows;
        }

        //Create the bootstrap table.
        table = $('#subscriber-table table').bootstrapTable({
            columns: columns,
            classes: 'table table-no-bordered table-hover',
            pagination: true,
            pageSize: 20,
            search: true,
            url: tmp,
            responseHandler: prepData,
            showRefresh: true
        });

        //Insert data into editor when clicking upon a row.
        $('#subscriber-table table').on('click-row.bs.table', function (row, $element, field) {
            drawForm($element);
            scrollToID('#subscribe-box', 750);
        });

        //Add extra toolbar buttons
        var buttons = "<div class='btn-group  pull-right table-custom-toolbar'>" +
            "<button class='btn highlight delete-subscribers' type='button'>" +
            "<span class='glyphicon glyphicon-trash'/></button>" +
            "<button class='btn blue new-subscriber' type='button'>" +
            "<span class='glyphicon glyphicon-plus'/></button>" +
            "</div>";
        $('.fixed-table-toolbar').append(buttons);

        //Enable the new subscriber button.
        $('button.new-subscriber').click( function(){
            drawForm();
        });

        //Enable the delete subscriber button.
        $('button.delete-subscribers').click( function(){

            //First of all extract the subscriberids and names of the subscribers to be deleted.
            var selected = $('#subscriber-table table').bootstrapTable('getSelections');
            var subscriberids = [];
            var confirmString = i18n.gettext("Are you sure you want to delete the following subscribers?") +
                "\n";
            for( var subscriber in selected ){
                subscriberids.push( selected[subscriber].id );
                confirmString = confirmString + selected[subscriber].first_name +
                                " " + selected[subscriber].last_name + ", ";
            }

            //If there are no subscriberids, just ignore.
            if( subscriberids.length > 0 ){
                //Check with the subscriber before doing the deletion.
                if( confirm(confirmString.slice(0, -2)) ){
                    //Do the deletion by posting json to server.
                    $.ajax({
                        url: '/en/messaging/delete_subscribers',
                        type: 'post',
                        success: function (data) {
                            alert(data);
                            $('#subscriber-table table').bootstrapTable('refresh');
                            drawForm();
                        },
                        error: function (data) {
                            alert( i18n.gettext( "There has been a server error. " +
                                   "Please contact administrator and try again later." ) );
                            $('.subscriber-editor .submit-form').text( buttonText );
                        },
                        contentType: 'application/json;charset=UTF-8',
                        data: JSON.stringify(subscriberids, null, '\t')
                    });
                }
            }
        });
    });
}

//Toggle all disease checkboxes when all diseases are selected.
function toggleAll(source){
	$('.disease').each( function(){
		this.checked = source.checked;
		this.disabled = source.checked ? true : false;
	});
}

// scroll function
function scrollToID(id, speed){
    var offSet = 50;
    var targetOffset = $(id).offset().top - offSet;
    var mainNav = $('#main-nav');
    $('html,body').animate({scrollTop:targetOffset}, speed);
}
