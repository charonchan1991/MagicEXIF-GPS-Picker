// Dependencies: 
//      |----- baidu map javascript v2.0 apis lib
//      |----- map_loader.js

var map;
var mapMarker;

function initializeMap() {

    var bdPos = MapCoordSrvc.wgs2bd(mapLatLng.lat, mapLatLng.lng);
    var defPos = new BMap.Point(bdPos.lng, bdPos.lat);
    map = new BMap.Map('mapUICanvas', {
        enableMapClick: false
    });
    map.centerAndZoom(defPos, mapZoom);
    map.enableScrollWheelZoom(true);

    // Load marker icon resources
    var mapMarkerIcon = new BMap.Icon('res/img/pin_normal.png', new BMap.Size(22, 38));
    var mapMarkerIconDrag = new BMap.Icon('res/img/pin_dragging_faded.png', new BMap.Size(22, 38));
    var mapMarkerIconDown = new BMap.Icon('res/img/pin_normal_faded.png', new BMap.Size(22, 38));
    mapMarker = new BMap.Marker(defPos, {icon: mapMarkerIcon});
    mapMarker.setOffset(new BMap.Size(0, -12));
    map.addOverlay(mapMarker);
    mapMarker.enableDragging();
    mapIsLoaded = true; // Set the flag to let the rest of App know

    // Define custom tools
    function CustomTools(){
        this.defaultAnchor = BMAP_ANCHOR_TOP_LEFT;
        this.defaultOffset = new BMap.Size(0, 0);
    }
    // Inherit from BMap.Control
    CustomTools.prototype = new BMap.Control();
    CustomTools.prototype.initialize = function(map){
        var mapUICtlBox = $("#mapUICtl");
        map.getContainer().appendChild(mapUICtlBox[0]);
        mapUICtlBox.show();
        return mapUICtlBox[0];
    }
    // Create an instance and add it to the map
    var customTools = new CustomTools();
    map.addControl(customTools);
    mapLoaderFunc.initializeTools();

    // Save the zoom level when map's zoom is changed
    map.addEventListener('zoomend', function() {
        mapZoom = map.getZoom();
    });

    // Change the marker icon to indicate dragging mode.
    mapMarker.addEventListener('mousedown', function(e) {
        mapMarker.setIcon(mapMarkerIconDown);
    });
    mapMarker.addEventListener('dragstart', function(e) {
        mapMarker.setIcon(mapMarkerIconDrag);
    });
    mapMarker.addEventListener('mouseup', function(e) {
        mapMarker.setIcon(mapMarkerIcon);
    });

    // Save the new location when the marker's pos changed
    mapMarker.addEventListener('dragend', function(e) {
        var wpsPos = MapCoordSrvc.bd2wgs(e.point.lat, e.point.lng);
        mapLatLng.lat = wpsPos.lat;
        mapLatLng.lng = wpsPos.lng;
        mapLoaderFunc.enableEdit();
    });
}

function moveMarkerTo(newPos){
    var bdPos = MapCoordSrvc.wgs2bd(newPos.lat, newPos.lng);
    var newLatLng = new BMap.Point(bdPos.lng, bdPos.lat);
    mapMarker.setPosition(newLatLng);
    map.panTo(newLatLng);
}