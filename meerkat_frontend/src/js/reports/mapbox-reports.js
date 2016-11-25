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

function regional_map( data, map_centre, geojson, containerID ){

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
            '<b>' + props.name + '</b><br />Value: ' +
            parseFloat(data[props.description].value).toFixed(4) : 'Hover over an area');
    };
    info.addTo(map);

    //Importing and formatting regional data
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

    // Let the user get extra data when hovering over a region.
    function highlightFeature(e){
        info.update(e.target.feature.properties);
    }

    // Reset the extra data when leaving a region.
    function resetHighlight(e){
        info.update();
    }

    // Find the centre of each region and store it in the data object.
    function onEachFeature(feature, layer){
        if( feature.properties.description != "?" ){
            // Get bounds of polygon
            var bounds = layer.getBounds();
            // Get center of bounds
            data[feature.properties.description].centre = bounds.getCenter();
            // Add region label when mouse over.
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }
    }

    //Create the geojson layer.
    var regionalLayer  = L.geoJson(geojson, {
        style: style,
        onEachFeature: onEachFeature
    });

    //Add the regions to the map.
    regionalLayer.addTo(map);

    // Create the region labels.
    for( var x in locs ){
        var location = data[locs[x]];
        var value = location.value;
        // Use technical/misc.js isInteger() because Number.isInteger()
        // is incompatiable with docraptor.
        if( !isInteger(value) ) value = value.toFixed(1);
        var icon = L.divIcon({
            className: 'area-label',
            html:"<div class='outer'><div class='inner'>" + value + "</div></div>"
        });
        //Only add the marker if both regional gemotry and api data exist.
        if(location.centre) L.marker(location.centre, {icon: icon}).addTo(map);
    }
}
