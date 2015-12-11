
/* This map visualises the number of reported cases for the given variable ID at
 * each clinic. The numbers of cases at each clinic shown using a colour gradient.
 */ 
function drawMap( varID, containerID ){

	$.getJSON( api_root+'/map/'+varID, function( data ){

		L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
		var map = L.mapbox.map(containerID, 'mrjb.k60d95kl', { 
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>' + 
					       ' contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">' +
					       'CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	 		maxZoom: 18,
			scrollWheelZoom: 'center',
	 		center: new L.LatLng( config.map.center.lat, config.map.center.lng ),
	 		zoom: config.map.zoom 
		});

		//Red colours 
		var colours6 = [ '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d' ];
		var colours4 = [ '#fc9272', '#ef3b2c', '#a50f15', '#67000d' ];
		var colours3 = [ '#fc9272', '#ef3b2c', '#67000d' ];
		var colours2 = [ '#fc9272', '#a50f15' ];

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

		//For each clinic, select the marker colour and add the marker to the map.
		for( i = 0; i < data.length; i++ ){

			var bin = Math.floor((data[i].value-1)/binSize); //-1 because bins are inclusive of the upper-limit
			
			var colour = colours[bin];

			var marker = L.circleMarker( L.latLng( data[i].geolocation[0], data[i].geolocation[1] ), { 
				radius: 5, 
				fillColor: colour, 
				opacity: 1, 
				fillOpacity: 1, 
				color: colour 
			});

			marker.bindPopup( "<b>" + data[i].clinic + "</b><br/>" + data[i].value + " cases" );
			marker.addTo( map );
		}

		//Add the legend.
		var legend = L.control({ position: 'bottomleft' });
		legend.onAdd = function( map ){

			var div = L.DomUtil.create( 'div', 'info_map legend' );

			for ( i=1; i<limits.length; i++ ) {

				if( binSize == 1 ){
					div.innerHTML += '<i class="circle" style="background:' + colours[i-1] + 
								        '; border-color:' + colours[i-1] + '"></i> ' + limits[i] + '<br/>';
				}else{
					div.innerHTML += '<i class="circle" style="background:' + colours[i-1] + 
								        '; border-color:' + colours[i-1] + '"></i> ' + (limits[i-1]+1) + 
								        '-' + limits[i] + '<br/>';
				}
			}

			return div;
		};

		legend.addTo( map );

	});
}
