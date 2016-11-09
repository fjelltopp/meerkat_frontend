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
    var map = L.mapbox.map(containerID, 'mrjb.143811c9', {
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

    //Import regional KML data.

    //Specify the basic style of the polygons.
    function style (feature){
      return {
         fillColor: '#688B9E',
         color: '#537080',
         weight: 4,
         opacity: 0,
         fillOpacity: 0
      };
    }

    //Create a custom layer to hold the style and the event listeners. 
    var customLayer = L.geoJson(null, {
        style: style
    });

    //Attach the custom layer features to the kml data and display on map.
    var regionalLayer = omnivore.kml(
        regionsURL, 
        null, 
        customLayer 
    );
    regionalLayer.addTo(map);
}
/*
//REGIONAL POLYGON DATA --------------------------

    //Don't de-highlight region upon "mouseout" event as region de-highlights when hovering over a surveilance site.
    //Instead store the region in this variable on mouseover and de-highlight it upon mouseover a different region.
    var highlightedRegion;



    //Quick fix to handle situations where surveillance site is reported as being in different regions by data and kml data. 
    var govSiteClash = false;

    //De-highlight the previously highlighted region, and then highlight the new region. 
    function highlightFeature (e){

      if (undefined === highlightedRegion ){
         highlightedRegion = e.target;
      }else{
         regionalLayer.resetStyle( highlightedRegion ); 
         if( highlightedRegion.toGeoJSON().properties.name != e.target.toGeoJSON().properties.name ){
           highlightedRegion = e.target;
           $(".details .selection").html("");
           govSiteClash = false;
         }
      }
      highlightedRegion.setStyle({
         fillOpacity: 0.1,
         opacity: 1
      });

      if (!L.Browser.ie && !L.Browser.opera) {
         highlightedRegion.bringToFront();
      }
      
      if( govSiteClash === false ){
         $("#regionName.value").text(i18n.gettext(highlightedRegion.toGeoJSON().properties.name));
      }

    }

    function clickFeature(e){
        enterMap(e);
        map.fitBounds(e.target.getBounds());
    }

    //Attached the highlight feture to the mouseover event. 
    function onEachFeature(feature, layer) {
      layer.on({
         mouseover: highlightFeature,
         click: clickFeature
      });
    }
*/

