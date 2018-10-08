/**:drawSubscriberTable()

    A function that draws the table of subscribers for the subscriber manager.
    It does this using bootstrap-table, a third party dependancy, collecting data
    from the /subscribers/get_subscribers resource.
*/
function drawSubscriberTable(){

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
            'width': "25%"
        },{
            'field': "last_name",
            'title': i18n.gettext('Last Name'),
            'align': "left",
            'class': "header",
            'sortable': true,
            'width': "25%"
        },{
            'field': "email",
            'title': i18n.gettext('Email'),
            'align': "left",
            'class': "header",
            'sortable': true,
            'width': "25%"
        },{
            'field': "sms",
            'title': i18n.gettext('SMS'),
            'align': "left",
            'class': "header",
            'sortable': true,
            'width': "25%"
        },{
            'field': "topics",
            'title': i18n.gettext('Topics'),
            'align': "left",
            'class': "header",
            'sortable': false,
            'visible': false,
            'searchable': true,
            'width': "25%"
        }
    ];

    //A function that prepares the data for displaying in the table.
    function prepData(res){
        // for( var a in res.rows ){
        //
        // }
        return res.rows;
    }

    var tmp = '/en/messaging/get_subscribers';
    console.log( "tmp: " + tmp );

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
    // $('#subscriber-table table').on('click-row.bs.table', function (row, $element, field) {
    //     drawSubscriberEditor($element.subscriberid);
    // });

    //Add extra toolbar buttons
    var buttons = "<div class='btn-group  pull-right table-custom-toolbar'>" +
        "<button class='btn highlight delete-subscribers' type='button'>" +
        "<span class='glyphicon glyphicon-trash'/></button>" +
        "<button class='btn blue new-subscriber' type='button'>" +
        "<span class='glyphicon glyphicon-plus'/></button>" +
        "</div>";
    $('.fixed-table-toolbar').append(buttons);

    //Enable the new subscriber button.
    // $('button.new-subscriber').click( function(){
    //     drawSubscriberEditor("");
    // });

    //Enable the delete subscriber button.
    // $('button.delete-subscribers').click( function(){
    //
    //     //First of all extract the subscriberids of the subscribers to be deleted.
    //     var selected = $('#subscriber-table table').bootstrapTable('getSelections');
    //     var subscriberids = [];
    //     var confirmString = i18n.gettext("Are you sure you want to delete the following subscribers?") +
    //         "\n";
    //     for( var subscriber in selected ){
    //         subscriberids.push( selected[subscriber].subscriberid );
    //         confirmString = confirmString + selected[subscriber].subscriberid + ", ";
    //     }
    //
    //     //If there are no subscriberids, just ignore.
    //     if( subscriberids.length > 0 ){
    //         //Check with the subscriber before doing the deletion.
    //         if( confirm(confirmString.slice(0, -2)) ){
    //             //Do the deletion by posting json to server.
    //             $.ajax({
    //                 url: root + '/en/subscribers/delete_subscribers',
    //                 type: 'post',
    //                 success: function (data) {
    //                     alert(data);
    //                     $('#subscriber-table table').bootstrapTable('refresh');
    //                     drawSubscriberEditor("");
    //                 },
    //                 error: function (data) {
    //                     alert( i18n.gettext( "There has been a server error. " +
    //                            "Please contact administrator and try again later." ) );
    //                     $('.subscriber-editor .submit-form').text( buttonText );
    //                 },
    //                 contentType: 'application/json;charset=UTF-8',
    //                 data: JSON.stringify(subscriberids, null, '\t')
    //             });
    //         }
    //     }
    // });
}
