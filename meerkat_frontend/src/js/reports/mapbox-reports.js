function draw_report_map(api_call, map_centre, containerID){
    $.getJSON(api_call, function(data) {
        map_from_data( data, map_centre, containerID );
    });
}

function createMap(containerID, map_centre){
    var map = L.map(containerID, {
        zoomControl: false,
        fullscreenControl: true,
        scrollWheelZoom: false,
        maxZoom: 25
    });
    L.mapbox.styleLayer(mapboxDefaultStyle).addTo(map);
    if( map_centre ) map.setView([map_centre[0], map_centre[1]], map_centre[2]);
    return map;
}

function ctc_point_map(point, containerID, map_centre){

    containerID = containerID || 'map';
    var map = createMap(containerID, map_centre);
    var ctcMarker = L.AwesomeMarkers.icon({
        icon: 'plus',
        markerColor: 'blue'
    });
    ctcMarker.options.shadowSize = [0, 0];
    var m = L.marker( [ point[0], point[1]], {icon: ctcMarker} );
    m.addTo(map);
    return map;
}


function ctc_surveyed_clinics_map(surveyed_points,non_surveyed_points, containerID, map_centre, in_technical, label){
    // Build the basic map using mapbox.
    label = label || "CTC";
    control = in_technical !== undefined ? true: false;
    var map = createMap(containerID, map_centre);

    // Setup map options.
    if(! control) {
        map.dragging.disable();
        map.on('fullscreenchange', function(){
            if (map.isFullscreen()) {
                map.dragging.enable();
            } else {
                map.dragging.disable();
            }
        });
    }

    // Add surveyed clinics to map
    for(var s_point in surveyed_points){
        var s_ctcMarker = L.AwesomeMarkers.icon({
            icon: 'plus',
            markerColor: 'blue'
        });
        s_ctcMarker.options.shadowSize = [0, 0];
        var s_m = L.marker( [ surveyed_points[s_point][0], surveyed_points[s_point][1]], {icon: s_ctcMarker} );
        s_m.bindPopup(surveyed_points[s_point][2]);
        s_m.addTo(map);
    }

    // Add non-surveyed clinics to map
    for(var n_point in non_surveyed_points){
        var n_ctcMarker = L.AwesomeMarkers.icon({
            icon: 'plus',
            markerColor: 'red'
        });
        n_ctcMarker.options.shadowSize = [0, 0];
        var n_m = L.marker( [ non_surveyed_points[n_point][0], non_surveyed_points[n_point][1]], {icon: n_ctcMarker} );
        n_m.bindPopup(non_surveyed_points[n_point][2]);
        n_m.addTo(map);
    }

    var legend = L.control({ position: 'bottomright' });
    legend.onAdd = function( map ){
        var div = L.DomUtil.create( 'div', 'marker-legend' );
        div.innerHTML += '<table><tr><td><div class="awesome-marker-icon-blue awesome-marker" style="position:relative""><i class="glyphicon glyphicon-plus icon-white"></i></div> </td><td><h2 style="display:inline">' + label + ' surveyed</h2></tr></table>';
        div.innerHTML += '<table><tr><td><div class="awesome-marker-icon-red awesome-marker" style="position:relative""><i class="glyphicon glyphicon-plus icon-white"></i></div> </td><td><h2 style="display:inline">' + label +' not surveyed</h2></tr></table>';
    return div;
    };
    legend.addTo(map);


    return map;
}


function map_from_data( data, map_centre, containerID){

    containerID = containerID || 'map';
    var map = createMap(containerID, map_centre);
    //  Disable map dragging on touch devices to ensure scrolling works
    map.dragging.disable();
    //  However, if we're fullscreen let's allow devices to drag
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });
    var geoJsonLayer = L.geoJson(data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.name);
        }
    });

    var markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        removeOutsideVisibleBounds: true
    });

    markers.addLayer(geoJsonLayer);
    map.addLayer(markers);

    if( !map_centre ) map.fitBounds(markers.getBounds(), {padding: [30, 30]});
}

function regional_map( data, map_centre, geojson, containerID, show_labels, extra_label ){
    show_labels = show_labels === undefined ? true : show_labels;
    containerID = containerID || 'map';
    var map = createMap(containerID, map_centre);
    // Setup map options.
    map.dragging.disable();
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });

    // Triggering event 'resizeMap' on container, resizes map to fill container
    $('#'+containerID).on('resizeMap', function(e){
        map.invalidateSize();
    });

    // Find the min and max in the data.
    var locs = Object.keys( data );
    var minimum = 999999;
    var maximum = 0;
    for( var l in locs ){
        var loc = data[locs[l]];
        minimum = loc.value < minimum && loc.value !== 0 ? loc.value : minimum;
        maximum = loc.value > maximum ? loc.value : maximum;
    }

    // Create a div to store the region/district label and the value.
    var info = L.control();
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };
    info.update = function (props) {
        this._div.innerHTML = (
            props ? '<b>' + props.Name + '</b><br />Value: ' +
            parseFloat(data[props.Name].value).toFixed(2) :
                i18n.gettext('Hover over an area')
        );
    };
    info.addTo(map);

    // Importing and formatting regional data
    // Specify the basic style of the polygons.
    function style (feature){
        // Basic polygon style is hidden from view with 0 opacity.
        var style = {
            fillColor: '#d9692a',
            color: '#c35d23',
            weight: 2,
            opacity: 0,
            fillOpacity: 0
        };
        // Only give the polygon opacity meerkat is implemented in the region.
        // Description should be a meerkat location_id, or a '?' if region
        // not currently implemented.
        if( data[feature.properties.Name] ){

            // Calculate the colour shade based on the max and min.
            // Looks odd if min is 0 opacity though.
            var opacity = (data[feature.properties.Name].value-minimum)/(maximum-minimum);
            opacity = 0.8*opacity + 0.2;
            style_opacity = 1;
            if(data[feature.properties.Name].value === 0){
                opacity=0;
                style_opacity = 0;
            }

            style.opacity = style_opacity;
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

    //  Find the centre of each region and store it in the data object.
    function onEachFeature(feature, layer){
        if( data[feature.properties.Name] ){
            //  Get bounds of polygon
            var bounds = layer.getBounds();
            //  Get center of bounds
            data[feature.properties.Name].centre = bounds.getCenter();
            //  Add region label when mouse over.
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        }
    }


    // Create the geojson layer.
    var regionalLayer  = L.geoJson(geojson, {
        style: style,
        onEachFeature: onEachFeature
    });

    // Add the regions to the map.
    regionalLayer.addTo(map);
    if(show_labels){
        // Create the region labels. Locs contains data keys.
        for( var x in locs ){
            var location = data[locs[x]];
            var value = location.value;
            // Use technical/misc.js isInteger() because Number.isInteger()
            // is incompatiable with docraptor.
            if( !isInteger(value) && value !== undefined) value = value.toFixed(1);
            var icon = L.divIcon({
                className: 'area-label',
                html: "<div class='outer'><div class='inner'>" + value +
                    "</div></div>"
            });
            // Only add the marker if both regional gemotry and api data exist.
            if(location.centre && value !== 0) L.marker(location.centre, {icon: icon}).addTo(map);


        }
        var legend2 = L.control({position: 'bottomright'});

        legend2.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            if( maximum === 0){
                div.innerHTML += i18n.gettext('No Cases');
            }else{
                div.innerHTML +=i18n.gettext('Areas without cases are not shown');
            }
            if(extra_label){
                div.innerHTML += extra_label;
            }
            return div;
        };
        legend2.addTo(map);
    }else{
        var legend = L.control({position: 'bottomright'});

        legend.onAdd = function (map) {

            var div = L.DomUtil.create('div', 'info legend');
            var grades = [];
            var labels = [];
            if(minimum == maximum){
                grades = [maximum];
                opacity = [0.2];
            }else{
                n = 6;
                grades = [minimum];
                opacity = [0.2];
                step = (maximum + 1 - minimum ) / n;
                for(var j=1;j<= n; j++){
                    grades.push(minimum + step * j);
                    opacity.push(0.8*j/n + 0.2);
                }
            }
            // loop through our density intervals and generate a label with a colored square for each interval
            if(grades.length == 1){
                div.innerHTML +=
                    'No Cases';

            }else{
                for (var i = 0; i < grades.length -1 ; i++) {
                    div.innerHTML +=
                        '<i style="background:#d9692a;opacity:'+opacity[i] + '"></i> ' +
                        parseFloat(grades[i]).toFixed(1) + '&ndash;' + parseFloat(grades[i + 1]).toFixed(1) + "<br />";
                }
            }

            return div;
        };

        legend.addTo(map);
    }

}
