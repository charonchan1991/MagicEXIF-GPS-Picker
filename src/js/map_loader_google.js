// Dependencies: 
//      |----- google maps javascript apis v3 lib
//      |----- map_loader.js

var map;
var mapMarker;

function initializeMap() {
    
    var defPos = transformToMap(mapLatLng);
    map = new google.maps.Map(document.getElementById('mapUICanvas'), {
        zoom: mapZoom,
        center: defPos,
        disableDefaultUI: true,
        clickableIcons: false
    });
    mapIsLoaded = true; // Set the flag to let the rest of App know

    // Add a marker at the center of the map
    mapMarker = new google.maps.Marker({
        position: defPos,
        map: map,
        icon: 'res/img/pin.png',
        draggable: true
    });
    
    // Custom tools
    var mapUICtlBox = $("#mapUICtl");
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(mapUICtlBox[0]);
    mapUICtlBox.show();
    mapLoaderFunc.initializeTools();

    // Save the zoom level when map's zoom is changed
    map.addListener('zoom_changed', function() {
        mapZoom = map.getZoom();
    });
    
    // Save the new location when the marker's pos changed
    mapMarker.addListener('mousedown', function(e) {
        mapMarker.setOpacity(0.6);
    });
    mapMarker.addListener('mouseup', function(e) {
        mapMarker.setOpacity(1.0);
    });
    mapMarker.addListener('dragend', function(e) {
        var lat = e.latLng.lat();
        var lng = e.latLng.lng();
        if (MapCoordSrvc.insideChina(lat, lng)){
            if (MapCoordSrvc.insideSAR(lat, lng)||MapCoordSrvc.insideTaiwan(lat, lng)){
                mapLatLng.lat = lat;
                mapLatLng.lng = lng;
            } else {
                var wpsPos = MapCoordSrvc.gcj2wgs(lat, lng);
                mapLatLng.lat = wpsPos.lat;
                mapLatLng.lng = wpsPos.lng;
            }
        } else {
            mapLatLng.lat = lat;
            mapLatLng.lng = lng;
        }
        mapLoaderFunc.enableEdit();
    });
}

function moveMarkerTo(newPos){
    var newLatLng = transformToMap(newPos);
    mapMarker.setPosition(newLatLng);
    map.panTo(newLatLng);
}

// latlng contains the real WGS84 coordinates
function transformToMap(latlng){
    if (MapCoordSrvc.insideChina(latlng.lat, latlng.lng)){
        if (MapCoordSrvc.insideSAR(latlng.lat, latlng.lng)||MapCoordSrvc.insideTaiwan(latlng.lat, latlng.lng)){
            return latlng;
        } else {
            var gcjPos = MapCoordSrvc.wgs2gcj(latlng.lat, latlng.lng);
            return {
                lat: gcjPos.lat,
                lng: gcjPos.lng 
            };
        }
    } else {
        return latlng;
    }
}