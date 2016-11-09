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

function regional_map( data, map_centre, containerID ){



}
