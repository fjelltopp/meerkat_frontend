/* This
 */
map = null;

/**:drawMap(varID, containerID, location)

    Draws a map that visualises the number of reported cases for the given variable ID at
    each clinic. The numbers of cases at each clinic shown using a colour gradient.

    :param string varID:
        The ID of the variable to be mapped.
    :param string containerID:
        The ID of the html element to hold the map.
    :param int location:
        The location ID to filter data by.
*/
function drawMap( varID, containerID, location, start_date, end_date, satellite){

    location = location || 1 ;

  url = api_root+'/map/'+varID+'/'+location;
  if( end_date ) url += '/' + end_date;
  if( start_date ) url += '/' + start_date;
  console.log( url );

	$.getJSON( url, function( data ){
        drawMapFromData( data, containerID, satellite );
	});
}

function drawMapFromData( data, containerID, satellite ){
   // console.log( "DRAWING MAP" );
   // console.log( data );
    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
    map = L.mapbox.map( containerID, 'mrjb.143811c9', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
                       ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">' +
                       'CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        scrollWheelZoom: false
    });

	if(satellite !== undefined){
		var sat_layer = L.mapbox.styleLayer('mapbox://styles/mrjb/ciymznczl00a12ro9cnd4v863');
		map.addLayer(sat_layer);
		sat_toggle = false;
		$("#" + satellite).click(function (){
			if(sat_toggle) {
				map.addLayer(sat_layer);
				sat_toggle = false;
				$("#" + satellite).html(i18n.gettext("Map"));
			}else{
				map.removeLayer(sat_layer);
				$("#" + satellite).html(i18n.gettext("Satellite"));
				sat_toggle = true;
			}
		});
	}
    if( config.map_centre ){
        map.setView(
            [config.map_centre[0], config.map_centre[1]],
            config.map_centre[2]
        );
    }

    //Red colours
    var colours6 = [ '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d' ];
    var colours4 = [ '#fc9272', '#ef3b2c', '#a50f15', '#67000d' ];
    var colours3 = [ '#fc9272', '#ef3b2c', '#67000d' ];
    var colours2 = [ '#fc9272', '#a50f15' ];

    //Default to the 6 colour system.
    //If fewer bins, due to smaller range, then change to fewer colours.
    var colours = colours6;

    //Find the clinic with the maximum variable value.
    var maximum = 0;
    for( var i in data ){
        if( data[i].value > maximum ){
            maximum = data[i].value;
        }
    }

    //Based on the maximum, choose the number of bins to group data into.
    if( maximum > 20 ){

        number = 6;
        colours = colours6;

    }else if( maximum > 10 ){

        number = 4;
        colours = colours4;

    }else if( maximum > 4 ){

        number = 3;
        colours = colours3;

    }else{

        colours = colours2;
        number = 2;
    }

    //Populate limits[] with the upper-limit for each bin.
    var binSize = Math.floor(maximum/number)+1;  // +1 because the final bin limit > maximum
    var limit = 0;
    var limits=[limit];

    while( limit < binSize*number ){
        limit += binSize;
        limits.push(limit);
    }
//    console.log(binSize);
//    console.log(number);
    markers = [];
    //For each clinic, select the marker colour and add the marker to the map.
    for(i in data){
		console.log(i);
		console.log(data[i]);
        var bin = Math.floor(data[i].value/binSize); //-1 because bins are inclusive of the upper-limit


        var colour = colours[bin];

        var marker = L.circleMarker( L.latLng( data[i].geolocation[0], data[i].geolocation[1] ), {
            radius: 5,
            fillColor: colour,
            opacity: 1,
            fillOpacity: 1,
            color: colour
        });

		marker.bindPopup( "<b>" + data[i].clinic + "</b><br/>" + data[i].value + " "+ i18n.gettext('cases'));
        marker.addTo( map );
        markers[markers.length] = marker;
    }
    if(markers.length > 0){
        var group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds());
    }

    //Add the legend.
    var legend = L.control({ position: 'bottomleft' });
    legend.onAdd = function( map ){

        var div = L.DomUtil.create( 'div', 'info_map legend' );

        for ( i=1; i<limits.length; i++ ) {

            if( binSize == 1 ){
                div.innerHTML += '<i class="circle" style="background:' + colours[i-1] +
                                    ' !important; border-color:' + colours[i-1] + '"></i> ' + limits[i] + '<br/>';
            }else{
                div.innerHTML += '<i class="circle" style="background:' + colours[i-1] +
                    ' !important; border-color:' + colours[i-1] + '"></i> ' + limits[i-1]  +
                    '-' + limits[i] + '<br/>';
            }
        }

        return div;
    };

    legend.addTo( map );
}


function drawIncidenceMap(name, varID, containerID, location, start_date, end_date ){

	location = location || 1 ;

	url = api_root+'/incidence_map/'+varID;
	if( end_date ) url += '/' + end_date;
	if( start_date ) url += '/' + start_date;
	console.log( url );

	$.getJSON( url, function( data ){

    //Todo:
    var isEmpty= true;
    for(var obj in data){
      isEmpty= false;
    }
    if(isEmpty){
      $('#disease-map-whiteBox').css("display", "none");
      whiteboxCounter = whiteboxCounter + 1;
      if (whiteboxCounter == 3){
        $('#emtyData-whiteBox').css("display", "block");
      }
    }

		console.log( data );
		L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
		map = L.mapbox.map( containerID, 'mrjb.143811c9', {
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
				' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">' +
				'CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	 		maxZoom: 18,
			scrollWheelZoom: false,
	 		center: new L.LatLng( config.map.center.lat, config.map.center.lng ),
	 		zoom: config.map.zoom
		});

		//Red colours
		var colours6 = [ '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d' ];
		var colours4 = [ '#fc9272', '#ef3b2c', '#a50f15', '#67000d' ];
		var colours3 = [ '#fc9272', '#ef3b2c', '#67000d' ];
		var colours2 = [ '#fc9272', '#a50f15' ];

		//Default to the 6 colour system.
		//If fewer bins, due to smaller range, then change to fewer colours.



		//Find the clinic with the maximum variable value.
		var maximum = 0;
		for( var i in data ){
			if( data[i].value > maximum ){
				maximum = data[i].value;
			}
		}
		var colours = colours6;
		number = 6;
		if( maximum > 20 ){

			number = 6;
			colours = colours6;

		}else if( maximum > 10 ){

			number = 4;
			colours = colours4;

		}else if( maximum > 4 ){

			number = 3;
			colours = colours3;

		}else{

			colours = colours2;
        number = 2;
		}




		//Populate limits[] with the upper-limit for each bin.
		var binSize = (maximum+1)/number;  // +1 because the final bin limit > maximum
		var limit = 0;
		var limits=[limit];

		while( limit < binSize*number ){
			limit += binSize;
			limits.push(limit);
		}
		markers = [];
		//For each clinic, select the marker colour and add the marker to the map.
		for(i in data){

			var bin = Math.floor(data[i].value/binSize); //-1 because bins are inclusive of the upper-limit

			var colour = colours[bin];

			var marker = L.circleMarker( L.latLng( data[i].geolocation[0], data[i].geolocation[1] ), {
				radius: bin + 1,
				fillColor: colour,
				opacity: 1,
				fillOpacity: 1,
				color: colour
			});

			marker.bindPopup( "<b>" + i18n.gettext(data[i].clinic) + "</b><br/>"+  i18n.gettext("Incidence Rate:")  + round(data[i].value, 1));
			marker.addTo( map );
			markers[markers.length] = marker;
		}
		if(markers.length > 0){
			var group = new L.featureGroup(markers);
			map.fitBounds(group.getBounds());
		}


		var info = L.control();

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info_map legend'); // create a div with a class "info"
			this._div.innerHTML = '<h4>' +i18n.gettext('Incidence Rates of') + " "+ i18n.gettext(name) +" "+i18n.gettext('per 1000.') + '</h4>';
			return this._div;
		};
		//Add the legend.
		info.addTo(map);
		var legend = L.control({ position: 'bottomleft' });
		legend.onAdd = function( map ){

			var div = L.DomUtil.create( 'div', 'info_map legend' );
			for ( i=1; i<limits.length; i++ ) {
					div.innerHTML += '<i class="circle" style="background:' + colours[i-1] +
					'; border-color:' + colours[i-1] + '"></i>' +round(limits[i-1], 1) +
					'-' + round(limits[i], 1)+ '<br />';
			}

			return div;
		};

		legend.addTo( map );
	});
}


function drawIncidenceChoroplet(var_name, varID, containerID, level, monthly){

	console.log(monthly);
	var url = api_root +'/incidence_rate/'+varID+'/'+ level + "/1000/1";
	if(monthly) url += "/1";

	$.getJSON( url, function( data ){
		$.getJSON(api_root + "/locations", function (locations) {
			$.getJSON(api_root + "/geo_shapes/" + level, function(geojson){
				geojson = geojson.features;
				L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
				map = L.mapbox.map( containerID, 'mrjb.143811c9', {
					attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
						' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">' +
						'CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	 				maxZoom: 18,
					scrollWheelZoom: false,
	 				center: new L.LatLng( config.map.center.lat, config.map.center.lng ),
	 				zoom: config.map.zoom
				});

				var loc_data = {};
				for(var d in data){
					console.log(d);
					loc_data[locations[d].name] = data[d];
				}
				console.log(loc_data);
				for(var key in geojson){
					var gj = geojson[key];

					var name = gj.properties.Name;
					if( name in loc_data){
						console.log(name);
						gj.properties.rate = loc_data[name];
					}else{
						gj.properties.rate = 0;
					}
				}


				var colours6 = [ '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d' ];

				//Default to the 6 colour system.
				//If fewer bins, due to smaller range, then change to fewer colours.
				var colours = colours6;
				var number = 6;
				//Find the clinic with the maximum variable value.
				var maximum = 0;
				for( var i in data ){
					if( data[i] > maximum ){
						maximum = data[i];
					}
				}

				//Populate limits[] with the upper-limit for each bin.
				var binSize = (maximum*1.05)/number;  // +1 because the final bin limit > maximum
				var limit = 0;
				var limits=[limit];

				while( limit < binSize*number ){
					limit += binSize;
					limits.push(limit);
				}
				function getColour(val){
					var bin = Math.floor(val/binSize); //-1 because bins are inclusive of the upper-limit
					return colours[bin];

				}
				function style(feature) {
					var opacity = 0.7;
					if(feature.properties.rate === 0){
						opacity = 0;
					}

					return {
						fillColor: getColour(feature.properties.rate),
						weight: 1.5,
						opacity: 1,
						color: 'white',
						dashArray: '2',
						fillOpacity: opacity
					};
				}

				function highlightFeature(e) {
					var layer = e.target;

					layer.setStyle({
						weight: 3,
						color: '#666',
						dashArray: '',
						fillOpacity: 0.7
					});

					if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
						layer.bringToFront();
					}
					info.update(layer.feature.properties);
				}

				function resetHighlight(e) {
					geojson_layer.resetStyle(e.target);
					info.update();
				}

				function onEachFeature(feature, layer) {
					layer.on({
						mouseover: highlightFeature,
						mouseout: resetHighlight
					});
				}

				geojson_layer =
					L.geoJson(geojson,
							  {style: style,
							   onEachFeature: onEachFeature
							  }).addTo(map);
				var info = L.control();

				info.onAdd = function (map) {
					this._div = L.DomUtil.create('div', 'info_map legend'); // create a div with a class "info"

					this.update();
					return this._div;
				};

				if(monthly){
					title = i18n.gettext("Monthly incidence rate of");
				}else {
					title = i18n.gettext("Incidence Rates of");
				}

				info.update = function (props) {
					this._div.innerHTML =  '<h4>'+title  + " "+ i18n.gettext(var_name) +" "+i18n.gettext('per 1000') +'</h4>' +  (props ?'<b>' + props.Name + '</b><br />'+ i18n.gettext('Incidence Rate') + " " + round(props.rate, 2) : i18n.gettext('Hover over a')+ " " + i18n.gettext(level));
				};

				//Add the legend.
				info.addTo(map);
				var legend = L.control({ position: 'bottomleft' });
				legend.onAdd = function( map ){

					var div = L.DomUtil.create( 'div', 'info_map legend' );
					for ( i=1; i<limits.length; i++ ) {
						div.innerHTML += '<i class="circle" style="background:' + colours[i-1] +
							'; border-color:' + colours[i-1] + '"></i> ' + round(limits[i-1],2) +
							'-' + round(limits[i],2) + '<br />';
					}

					return div;
				};

				legend.addTo( map );


			});
		});
	});

}


function drawCasesChoroplet(var_name, varID, containerID, level, centre_lat, centre_lng, zoom){
	var url = api_root +'/query_variable/'+varID+'/locations:'+ level;
	$.getJSON( url, function( data ){
		drawCasesChoropletFromData(data, var_name, containerID, level, centre_lat, centre_lng, zoom);
	});
}

function drawCasesChoropletLatestWeekly(var_name, varID, identifier_id, containerID, level, centre_lat, centre_lng, zoom, title){
	var url = api_root +'/aggregate_latest_level/'+varID+'/' + identifier_id + "/" + level;
	$.getJSON( url, function( data ){
		drawCasesChoropletFromData(data, var_name, containerID, level, centre_lat, centre_lng, zoom, title);
	});
}
function drawCasesChoropletFromData(data, var_name, containerID, level, centre_lat, centre_lng, zoom, title){
	$.getJSON(api_root + "/locations", function (locations) {
		$.getJSON(api_root + "/geo_shapes/" + level, function(geojson){
			geojson = geojson.features;
			L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
			map = L.mapbox.map( containerID, 'mrjb.143811c9', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' +
					' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">' +
					'CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	 			maxZoom: 18,
				scrollWheelZoom: false,
	 			center: new L.LatLng( centre_lat ? centre_lat : config.map.center.lat,
									  centre_lng ? centre_lng : config.map.center.lng ),
	 			zoom: zoom ? zoom : config.map.zoom
			});

			var loc_data = {};
			for(var d in data){
				console.log(d);
				loc_data[d] = data[d].total;
			}
			console.log(loc_data);
			for(var key in geojson){
				var gj = geojson[key];

				var name = gj.properties.Name;
				if( name in loc_data){
					console.log(name);
					gj.properties.rate = loc_data[name];
				}else{
					gj.properties.rate = 0;
				}
			}


			var colours6 = [ '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d' ];

			//Default to the 6 colour system.
			//If fewer bins, due to smaller range, then change to fewer colours.
			var colours = colours6;
			var number = 6;
			//Find the clinic with the maximum variable value.
			var maximum = 0;
			for( var i in data ){
				if( data[i].total > maximum ){
					maximum = data[i].total;
				}
			}

			//Populate limits[] with the upper-limit for each bin.
			var binSize = (maximum + 1)/number;  // +1 because the final bin limit > maximum
			var limit = 0;
			var limits=[limit];

			while( limits.length <= number){
				limit += binSize;
				limits.push(limit);

			}
			function getColour(val){
				var bin = Math.floor(val/binSize); //-1 because bins are inclusive of the upper-limit
				return colours[bin];

			}
			function style(feature) {
				var opacity = 0.7;
				if(feature.properties.rate === 0){
					opacity = 0;
				}

				return {
					fillColor: getColour(feature.properties.rate),
					weight: 1.5,
					opacity: 1,
					color: 'white',
					dashArray: '2',
					fillOpacity: opacity
				};
			}

			function highlightFeature(e) {
				var layer = e.target;

				layer.setStyle({
					weight: 3,
					color: '#666',
					dashArray: '',
					fillOpacity: 0.7
				});

				if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
					layer.bringToFront();
				}
				info.update(layer.feature.properties);
			}

			function resetHighlight(e) {
				geojson_layer.resetStyle(e.target);
				info.update();
			}

			function onEachFeature(feature, layer) {
				layer.on({
					mouseover: highlightFeature,
					mouseout: resetHighlight
				});
			}

			geojson_layer =
				L.geoJson(geojson,
						  {style: style,
						   onEachFeature: onEachFeature
						  }).addTo(map);
			var info = L.control();

			info.onAdd = function (map) {
				this._div = L.DomUtil.create('div', 'info_map legend'); // create a div with a class "info"

				this.update();
				return this._div;
			};

			if (title === undefined){
				title =  i18n.gettext('Number of cases of') + " "+ i18n.gettext(var_name);
			}
			console.log(title);

			info.update = function (props) {
				this._div.innerHTML =  '<h4>' +title +'</h4>' +  (props ?'<b>' + props.Name + '</b><br /> ' + props.rate : i18n.gettext('Hover over a') + " " + i18n.gettext(level));
			};

			//Add the legend.
			info.addTo(map);
			var legend = L.control({ position: 'bottomleft' });
			legend.onAdd = function( map ){

				var div = L.DomUtil.create( 'div', 'info_map legend' );
				for ( i=1; i<limits.length; i++ ) {
					div.innerHTML += '<i class="circle" style="background:' + colours[i-1] +
						'; border-color:' + colours[i-1] + '"></i> ' + round(limits[i-1],0) +
						'-' + round(limits[i],0) + '<br/>';
				}

				return div;
			};

			legend.addTo( map );
		});
	});


}
