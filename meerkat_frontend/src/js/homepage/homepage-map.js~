$( function() {

    //SHOW THE MAP ----------------------------------------------
    L.mapbox.accessToken = 'pk.eyJ1IjoibXJqYiIsImEiOiJqTXVObHJZIn0.KQCTcMow5165oToazo4diQ';
    var map = L.mapbox.map('map', 'mrjb.k60d95kl', { zoomControl:false });

    function resetMapView (map){
      //Determine the map position based on the screen size
      if( $(window).width() < 490 ){
           map.setView([30.850011, 35.470810], 8);
      }else{
           map.setView([30.850011, 35.470810], 8);
      }
      //Ensure the map overlay is visible
      $('#map-overlay').slideDown();  
      $('#techSiteBtn').slideDown();
      // Disable drag and zoom handlers.
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      // Disable tap handler, if present.
      if (map.tap) map.tap.disable();
      $('#keyBody').text("Click on a region to explore");
      $('#keyBody').removeClass('clickable');
      //if( undefined != regionalLayer ) map.removeLayer(regionalLayer);
         
    }

    resetMapView(map);

    var markers = new L.MarkerClusterGroup({ showCoverageOnHover: false });


    $.getJSON( "api/map", function( data ){
      $.each( data.map, function( x, z ){ 
          if( z.lat !== "" && z.lng !== "" ){
            var m = L.marker( [ z.lat, z.lng]);
            m.name = z.name;
            m.cases = z.cases;
            m.consulatations = z.consultations;
            console.log(m);
            markers.addLayer( m );
         }
      });
    });

    map.addLayer( markers );

    //REGIONAL POLYGON DATA --------------------------

    //Don't de-highlight region upon "mouseout" event as region de-highlights when hovering over a surveilance site.
    //Instead store the region in this variable on mouseover and de-highlight it upon mouseover a different region.
    var highlightedRegion;

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
           $("#selectionDetails").html("");
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
         $("#regionName.value").text(highlightedRegion.toGeoJSON().properties.name);
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



    //Create a custom layer to hold the style and the event listeners. 
    var customLayer = L.geoJson(null, {
      style: style,
      onEachFeature: onEachFeature,
    });

    //Attach the custom layer features to the kml data and display on map.
    var regionalLayer = omnivore.kml('regional.kml', null, customLayer );


    function enterMap(a){
         //Hide the overlay.
         $('#map-overlay').slideUp();
         $('#techSiteBtn').slideUp();
         //Enable map viewing functions.
         map.dragging.enable();
         map.touchZoom.enable();
         map.scrollWheelZoom.enable();
         if (map.tap) map.tap.enable();
         // Show the key overlay/
         $('#keyBody').text("Click here to finish.");
         $('#keyBody').addClass('clickable');
    }

    regionalLayer.addTo(map);
    //Upon clicking upon a cluster allow the user to explore the map.
    markers.on('clusterclick', enterMap); 

    markers.on('click', function (a) {

      if( $("#regionName.value").text() != a.layer.gov ){ 
         $("#regionName.value").text(a.layer.gov);
         govSiteClash = true;
      }

      var info =  "<span id='name' class='label' > Facility Name: </span> <span id='name' class='value' > " +
                  a.layer.name + "</span></br>" +
                  "<span id='cons' class='label' > # Consultations: </span> <span id='cons' class='value' > " +
                  a.layer.consultations + "</span></br>" +
                  "<span id='cases' class='label' > # Cases: </span> <span id='cases' class='value' > " +
                  a.layer.cases + "</span></br>" +
                  "<span id='lat' class='label' > Lat: </span> <span id='lat' class='value' >" +
                  Math.round(a.layer.getLatLng().lat*10000)/10000 + "</span>" +
                  "<span id='lng' class='label' > Lng: </span> <span id='lng' class='value' >"  +
                  Math.round(a.layer.getLatLng().lng*10000)/10000+ "</span></br>";
      
      $("#selectionDetails").html(info);  
    });

    //Allow the user to click on the key in order to zoom out.
    $('#keyText').on('click', function(event){
         resetMapView(map);
    });

});
