

function draw_public_health_map(api_call, map_centre){
    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
    var map = L.mapbox.map('map', 'mrjb.143811c9', {
	zoomControl: false,
	fullscreenControl: true // Display fullscreen toggle button
    })
    .setView([map_centre[0], map_centre[1]], map_centre[2]);

    // Disable map dragging on touch devices to ensure scrolling works
    map.dragging.disable();
    // However, if we're fullscreen let's allow devices to drag
    map.on('fullscreenchange', function () {
      if (map.isFullscreen()) {
          // Let's enable dragging as we're fullscreen
          map.dragging.enable();
      } else {
          map.dragging.disable();
      }
    });

  $.getJSON(api_call, function(data) {
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
  });
}
