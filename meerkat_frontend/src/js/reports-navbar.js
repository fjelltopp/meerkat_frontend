$(function() {
  $.getJSON("/api/location_hierarchy/3", function(result) {
    var locationMenuItems = $("#location-menu");
    console.log(result);
    $.each(result, function(key, value) {
      //locationMenuItems.append($("<li/>").val(this.id).text(this.title));
      console.log(this);
    });
  });
});
