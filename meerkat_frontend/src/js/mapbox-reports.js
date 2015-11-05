$(function() {
  L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
  var map = L.mapbox.map('map', 'mrjb.k60d95kl', {
      zoomControl: false,
      fullscreenControl: true // Display fullscreen toggle button
    })
    .setView([31.5, 36], 7);

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

  $.getJSON('https://jordan.emro.info/api/geojson_clinics/2', function(data) {
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
    map.fitBounds(markers.getBounds());
  });
});
