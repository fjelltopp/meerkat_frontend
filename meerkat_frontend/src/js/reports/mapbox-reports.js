function draw_report_map(api_call, map_centre, containerID){
    $.getJSON(api_call, function(data) {
        map_from_data( data, map_centre, containerID );
    });
}

function map_from_data( data, map_centre, containerID){

    if( !containerID ) containerID = 'map';

    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
    var map = L.mapbox.map(containerID, 'mrjb.143811c9', {
	      zoomControl: false,
	      fullscreenControl: true, // Display fullscreen toggle button
        scrollWheelZoom: false
    })
    .setView([map_centre[0], map_centre[1]], map_centre[2]);

    // Disable map dragging on touch devices to ensure scrolling works
    map.dragging.disable();
    // However, if we're fullscreen let's allow devices to drag
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            // Let's enable dragging as we're fullscreen
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });

    var geoJsonLayer = L.geoJson(data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(i18n.gettext(feature.properties.name));
        }
    });

    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        removeOutsideVisibleBounds: true
    });

    markers.addLayer(geoJsonLayer);
    map.addLayer(markers);
    map.fitBounds(markers.getBounds());

}

function regional_map( data, map_centre, regionsURL, containerID ){

    //If no containerID is provided, assume we're looking for a container ID of "map".
    if( !containerID ) containerID = 'map';

    //Build the basic map using mapbox.
    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
    map = L.mapbox.map(containerID, 'mrjb.143811c9', {
	      zoomControl: false,
	      fullscreenControl: true,
        scrollWheelZoom: false
    }).setView([map_centre[0], map_centre[1]], map_centre[2]);

    //Setup map options.
    map.dragging.disable();
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });

    //Find the min and max in the data.
    var locs = Object.keys( data );
    var minimum = 999999;
    var maximum = 0;
    for( var l in locs ){
        var loc = data[locs[l]];
        minimum = loc.value < minimum ? loc.value : minimum;
        maximum = loc.value > maximum ? loc.value : maximum; 
    }

    //Create a div to store the region/district label and the value.
    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = ( props ?
            '<b>' + props.name + '</b><br />Value: ' + data[props.description].value 
            : 'Hover over an area');
    };
    info.addTo(map);

    //Importing and formatting regional KML data
    //Specify the basic style of the polygons.
    function style (feature){
        //Basic polygon style is hidden from view with 0 opacity.
        var style = {
            fillColor: '#d9692a',
            color: '#c35d23',
            weight: 2,
            opacity: 0,
            fillOpacity: 0
        };
        //Only give the polygon opacity if the region is one where meerkat is implemented.
        //Description should be a meerkat location_id, or a '?' if region not currently implemented.   
        if( feature.properties.description != "?" ){
            //Calculate the colour shade based on the max and min. Looks odd if min is 0 opacity though.
            var opacity = ((data[feature.properties.description].value-minimum)/(maximum-minimum));
            opacity = 0.8*opacity + 0.2;
            style.opacity = 1;
            style.fillOpacity = opacity;
        }
        return style;
    }

    function highlightFeature(e){
        console.log( e.target.feature.properties );
        info.update(e.target.feature.properties);
    }

    function resetHighlight(e){
        info.update();
    }

    //Find the centre of each region and store it in the data object.
    function onEachFeature(feature, layer){
        if( feature.properties.description != "?" ){
            // Get bounds of polygon
            var bounds = layer.getBounds();
            // Get center of bounds
            data[feature.properties.description].centre = bounds.getCenter();
            //Add region label when mouse over.
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }
    }

    //Create a custom layer to hold the style and the event listeners. 
    var customLayer = L.geoJson(null, {
        style: style,
        onEachFeature: onEachFeature
    });

    //Attach the custom layer features to the kml data and display on map.
    var regionalLayer = omnivore.kml(
        regionsURL, 
        null, 
        customLayer 
    );
    
    //Add the regions to the map.
    regionalLayer.addTo(map);

    //Store the maps in "this" so we can pass the context to callback functions.
    if( !this.maps ) this.maps = [map];
    else this.maps.push(map);

    //Make sure we know which map we're working with.
    var index = this.maps.indexOf(map);

    //Once the regions have been added, add case labels.
    regionalLayer.on('ready', function(){
        for( var l in locs ){
            var loc = data[locs[l]];
            var icon = L.divIcon({
                className: 'area-label', 
                html:"<div class='outer'><div class='inner'>" + loc.value + "</div></div>"
            });
            //Only add the marker if both regional gemotry and api data exist.
            if(loc.centre) L.marker(loc.centre, {icon: icon}).addTo(this.maps[index]); 
            else console.error( "Failed to find regional geometry for location '" + 
                               loc.name + "' with value " + loc.value + "." );
        }
    }, this);


}


