function draw_report_map(api_call, map_centre, containerID){
    $.getJSON(api_call, function(data) {
        map_from_data( data, map_centre, containerID );
    });
}

function map_from_data( data, map_centre, containerID){

    if( !containerID ) containerID = 'map';


    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.' +
                           'KQCTcMow5165oToazo4diQ';
    var map = L.mapbox.map(containerID, 'mrjb.143811c9', {
	      zoomControl: false,
	      fullscreenControl: true, //  Display fullscreen toggle button
        scrollWheelZoom: false
    });

    if( map_centre ) map.setView([map_centre[0], map_centre[1]], map_centre[2]);
    //  Disable map dragging on touch devices to ensure scrolling works
    map.dragging.disable();
    //  However, if we're fullscreen let's allow devices to drag
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            //  Let's enable dragging as we're fullscreen
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });

    var geoJsonLayer = L.geoJson(data, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup(feature.properties.Name);
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

function regional_map( data, map_centre, geojson, containerID, show_labels ){

	if(show_labels === undefined){show_labels = true;}
	
    console.log( "Creating regional map.");
    console.log( geojson );
    // If no containerID is provided, assume containerID "map".
    if( !containerID ) containerID = 'map';

    // Build the basic map using mapbox.
    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.' +
                           'KQCTcMow5165oToazo4diQ';
    map = L.mapbox.map(containerID, 'mrjb.143811c9', {
	      zoomControl: false,
	      fullscreenControl: true,
        scrollWheelZoom: false
    }).setView([map_centre[0], map_centre[1]], map_centre[2]);

    // Setup map options.
    map.dragging.disable();
    map.on('fullscreenchange', function(){
        if (map.isFullscreen()) {
            map.dragging.enable();
        } else {
            map.dragging.disable();
        }
    });

    // Find the min and max in the data.
    var locs = Object.keys( data );
    var minimum = 999999;
    var maximum = 0;
    for( var l in locs ){
        var loc = data[locs[l]];
        minimum = loc.value < minimum ? loc.value : minimum;
        maximum = loc.value > maximum ? loc.value : maximum;
    }
    console.log( "MinMax" );
    console.log( minimum );
    console.log( maximum );
	console.log(data);
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
			if( !isInteger(value) ) value = value.toFixed(1);
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
				div.innerHTML +=i18n.gettext('No Cases');
			}else{
				div.innerHTML +=i18n.gettext('Areas without cases are not shown');
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
