// Access nested property of object using sting key.
function getNested (theObject, path) {
    try {
        separator = '.';

        return path.
            replace('[', separator).replace(']','').
            split(separator).
            reduce(
                function (obj, property) {
                    return obj[property];
                }, theObject
            );

    } catch (err) {
        return undefined;
    }
}

function setup_homepage(){

    //SET THE SCREEN SIZE-----------------------------------------
    //Make sure that objects with class screen don't over fill the screen due to the NavBar
    $('.screen').css( "height", $(window).height()-$('.navbar').height() );


    //CREATE SLIDABLE LIST ITEMS FOR PRINCIPLES---------------------------------------------
    $('.slides li .clickable').on( 'click', function(event){
        $(this).parent().children(".slideCont").slideToggle();
    });

    //If there is no console, don't bother logging anything.
    if (typeof console === "undefined") {
        console = {
            log: function() { }
        };
    }

    //SCROLLING BUTTONS-------------------------------------------
    //Handle the scrolling buttons
    // navigation click actions
    $('.scroll-link').on('click', function(event){
        event.preventDefault();
        var sectionID = $(this).attr("data-id");
        scrollToID('#' + sectionID, 750);
        resetMapView(map);
    });

    // scroll to top action
    $('.scroll-top').on('click', function(event) {
        event.preventDefault();
        $('html, body').animate({scrollTop:0}, 'slow');
        $('.navbar-nav li.active').removeClass('active');
        resetMapView(map);
    });

    //Manage the link highlighting
    $('.navbar-nav li').on('click', function(event){
        $('.navbar-nav li.active').removeClass('active');
        $(this).addClass('active');
    });

    // Auto close mobile nav menu after selection
    $('.nav a').on('click', function(){
        if ($(document).width() <= 991) $(".navbar-toggle").click();
    });

    // Auto closs mobile nav menu after selection
    $('a.navbar-brand').on('click', function(){
        if ($(document).width() <= 991 && !$(".navbar-toggle").hasClass("collapsed")){
            $(".navbar-toggle").click();
        }
    });

    // scroll function
    function scrollToID(id, speed){
        var offSet = 0;
        var targetOffset = $(id).offset().top - offSet;
        var mainNav = $('#main-nav');
        $('html,body').animate({scrollTop:targetOffset}, speed);
    }

    //SHOW THE KEY_INDICATORS ----------------------------------------------
    var indicators = content.key_indicators;
    var deferreds = [];
    function create_deferred(indicator){
        return $.getJSON(api_root + indicators[indicator].api, function(data){
            indicators[indicator].data = data;
        });
    }
    for (var i in indicators){
        deferreds.push(create_deferred(i));
    }

    $.when.apply($, deferreds).then(function() {

        for(var i in indicators){
            var indicator = indicators[i];
            console.log(indicator);
            indicator.value = getNested(indicator.data, indicator.value);

            // 7 digit figures over flow the box, so shorthand big numbers.
            if(parseFloat(indicator.value) > 999999){
                var millions = indicator.value/1000000;
                millions = sigFigs(millions, 2);  // Round to 2 sf.
                indicator.value = millions + "<span style='font-size:23px'> million</span>";
            }

            $('#keyIndicatorsList').append(
                '<div id="consultationsPanel" class="panel keyIndicator">' +
                '<div class="kiNumber" > <div id="' + indicator.id +
                '" class="kiValue">' + indicator.value + '</div> </div>' +
                '<div class="kiLabel">' + i18n.gettext(indicator.text) + '</div></div>'
            );
        }

        if($('#kiViewer .window').width() < 210*indicators.length) $('#kiViewer .chevron').toggleClass('hidden');
    });

    $('#leftButton').click( function(){
        pos = parseInt($('#keyIndicatorsList').css("left"));
        //If a button is pressed before animation is complete, the viewing window can endup straddling a panel.
        //We don't want this, so remove the "straddle" distance from the panel-list's position.
        pos = pos - (pos % 210);

        if( window.matchMedia( "(max-width: 700px)" ).matches ) bounce=630;
        else bounce = 210;

        if( pos > -210 ){
             $('#keyIndicatorsList').animate( {"left": "-" + bounce +"px" }, "slow");
        }else{
             $('#keyIndicatorsList').animate( {"left": (pos+210)+"px"}, "slow");
        }
    });

    $('#rightButton').click( function(){
        pos = parseInt($('#keyIndicatorsList').css("left"));
        pos = pos - (pos % 210);
        if( window.matchMedia( "(max-width: 700px)" ).matches ) bounce=630;
        else bounce = 210;
        if( pos <= -bounce ){
             $('#keyIndicatorsList').animate( {"left": "0px"}, "slow");
        }else{
             $('#keyIndicatorsList').animate( {"left": (pos-210)+"px"}, "slow");
        }
    });

    //SHOW THE MAP ----------------------------------------------
    var map = L.map('map', {zoomControl:false, maxZoom:25});

    var gl = new L.mapboxGL({
        accessToken: mapboxAccessToken,
        style: mapboxDefaultStyle
    }).addTo(map);

    var viewingMap = false;

    function resetMapView (){
        //Set the map position.
        map.setView(
            [content.map.center.lat, content.map.center.lng],
            content.map.zoom
        );
        //Ensure the map overlay is visible.
        $('#map-home .title-overlay').slideDown();
        $('#map-home .techSiteBtn').slideDown();
        // Disable drag and zoom handlers.
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        // Disable tap handler, if present.
        if (map.tap) map.tap.disable();
        $('.key .keyBody').text(i18n.gettext("Click here to explore"));
        //if( undefined != regionalLayer ) map.removeLayer(regionalLayer);
        viewingMap = false;
    }

    resetMapView(map);
    $.extend(L.Icon.Default.prototype.options, {imagePath:"/static/img/"});
    var markers = new L.MarkerClusterGroup({ showCoverageOnHover: false });

    $.getJSON( api_root + "/tot_map", function( reports ){
        $.getJSON( api_root + "/consultation_map", function( consultations ){
            for (var key in reports){
                if (reports.hasOwnProperty(key)){
                    var report = reports[key];
                    var consultation = consultations[key];

                    if( report.geolocation[0] && report.geolocation[1] ){
                        var m = L.marker( [ report.geolocation[0], report.geolocation[1]] );
                        m.name = i18n.gettext(report.clinic);
                        m.cases = report.value;
                        m.consultations = consultation.value;
                        markers.addLayer( m );
                    }
                }
            }
        });
    });

    map.addLayer( markers );

    //REGIONAL POLYGON DATA --------------------------
    $.getJSON( api_root + "/geo_shapes/region", function( regions ){
        var regionalLayer = L.geoJson(regions, {style: style, onEachFeature: onEachFeature});

        regionalLayer.addTo(map);
        //Don't de-highlight region upon "mouseout" event as region de-highlights when hovering over a surveilance site.
        //Instead store the region in this variable on mouseover and de-highlight it upon mouseover a different region.
        var highlightedRegion;

        //Specify the basic style of the polygons.
        function style (feature){
            return {
                fillColor: '#688B9E',
                color: '#537080',
                weight: 4,
                opacity: 0,
                fillOpacity: 0
            };
        }

        //Quick fix to handle situations where surveillance site is reported as being in different regions by data and kml data.
        var govSiteClash = false;

        //De-highlight the previously highlighted region, and then highlight the new region.
        function highlightFeature (e){

            if (undefined === highlightedRegion ){
                highlightedRegion = e.target;
            }else{
                regionalLayer.resetStyle( highlightedRegion );
                if( highlightedRegion.toGeoJSON().properties.Name != e.target.toGeoJSON().properties.Name ){
                    highlightedRegion = e.target;
                    $(".details .selection").html("");
                    govSiteClash = false;
                }
            }
            highlightedRegion.setStyle({
                fillOpacity: 0.1,
                opacity: 1
            });

            if (!L.Browser.ie && !L.Browser.opera) {
                highlightedRegion.bringToFront();
            }

            if( govSiteClash === false ){
                $("#regionName.value").text( highlightedRegion.toGeoJSON().properties.Name );
            }

        }

        function clickFeature(e){
            enterMap(e);
            map.fitBounds(e.target.getBounds());
        }

        //Attached the highlight feture to the mouseover event.
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                click: clickFeature
            });
        }

        //Create a custom layer to hold the style and the event listeners.
        var customLayer = L.geoJson(null, {
            style: style,
            onEachFeature: onEachFeature,
        });

        //Attach the custom layer features to the kml data and display on map.
        function enterMap(){
             //Hide the overlay.
             $('#map-home .title-overlay').slideUp();
             $('#map-home .techSiteBtn').slideUp();
             //Enable map viewing functions.
             map.dragging.enable();
             map.touchZoom.enable();
             map.scrollWheelZoom.enable();
             if (map.tap) map.tap.enable();
             // Show the key overlay/
             $('.key .keyBody').text(i18n.gettext("Click here to finish."));
            viewingMap=true;
        }


        //Upon clicking upon a cluster allow the user to explore the map.
        markers.on('clusterclick', enterMap);
        markers.on('click', function (a) {

            if( $("#regionName.value").text() != a.layer.gov ){
                $("#regionName.value").text(a.layer.gov);
                govSiteClash = true;
            }

            var info =  "<span id='name' class='label' >" +i18n.gettext('Facility Name:') +" </span> <span id='name' class='value' > " +
                        a.layer.name + "</span></br>" +
                        "<span id='cons' class='label' >" +i18n.gettext('# Consultations:') +" </span> <span id='cons' class='value' > " +
                        a.layer.consultations + "</span></br>" +
                        "<span id='cases' class='label' > "+i18n.gettext('# Cases:')+" </span> <span id='cases' class='value' > " +
                        a.layer.cases + "</span></br>" +
                        "<span id='lat' class='label' >" +i18n.gettext('Lat:') +" </span> <span id='lat' class='value' >" +
                        Math.round(a.layer.getLatLng().lat*10000)/10000 + "</span>" +
                        "<span id='lng' class='label' >" +i18n.gettext('Lng:') +" </span> <span id='lng' class='value' >"  +
                        Math.round(a.layer.getLatLng().lng*10000)/10000+ "</span></br>";

            $("#map-home .details .selection").html(info);
            console.log(a.layer);
        });

        //Allow the user to click on the key in order to enter and exit the map.
        $('.key .keyText').on('click', function(event){
             if(viewingMap) resetMapView();
                else enterMap();
        });
    });


    function createCallback(overlay, map) {
        return function(data) {
            if (overlay.type == "area"){
                overlayLayer = L.geoJson(data, {style: function(feature){
                    return {
                        fillColor: overlay.colour,
                        color: '#537080',
                        weight: 0,
                        fillOpacity: overlay.opacity,
                    };
                }});
                overlayLayer.addTo(map);
            }else if(overlay.type == "marker") {
                my_json = L.geoJson(data, {
                    pointToLayer: function(feature, latlng) {
                        var Icon = new L.icon({
                            iconUrl: "/static/" + overlay.markericon,
                            iconSize: [30, 30], // size of the icon
                            iconAnchor: [15, 15], // point of the icon which will correspond to marker's location
                            popupAnchor: [30, 30] // point from which the popup should open relative to the iconAnchor
                        });
                        return L.marker(latlng, {icon: Icon});
                    },
                });
              my_json.addTo(map);
            }
        };
    }

    overlays = content.map;
    styles = [];
    if("overlay" in overlays){
        for(var o in overlays.overlay){
            overlay = overlays.overlay[o];
            $.getJSON("/static/" + overlay.file, createCallback(overlay, map));
        }
    }
}
