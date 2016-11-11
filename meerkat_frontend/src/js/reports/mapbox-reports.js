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
    this.map = {};
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

    //Import regional KML data.

    //Specify the basic style of the polygons.
    function style (feature){
        if( feature.properties.description != "?" ){
            var opacity = ((data[feature.properties.description].value-minimum)/(maximum-minimum));
            opacity = 0.6*opacity + 0.4;
            return {
                fillColor: '#d9692a',
                color: '#c35d23',
                weight: 2,
                opacity: 100,
                fillOpacity: opacity
            };
        }else{
            return {
                fillOpacity: 0,
                opacity: 0 
            };
        }
    }

    //Find the centre of each region and store it in the data object.
    function onEachFeature(feature, layer) {
        if( feature.properties.description != "?" ){
            // Get bounds of polygon
            var bounds = layer.getBounds();
            // Get center of bounds
            data[feature.properties.description].centre = bounds.getCenter();
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

    //Once the regions have been added, add case labels.
    regionalLayer.on('ready', function(){
        for( var l in locs ){
            var loc = data[locs[l]];
            var icon = L.divIcon({
                className: 'area-label', 
                html:"<div class='outer'><div class='inner'>" + loc.value + "</div></div>"
            });
	          L.marker(loc.centre, {icon: icon}).addTo(map); 
        }
    }, map);


}


