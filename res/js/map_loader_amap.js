// Dependencies: 
//      |----- amap javascript apis v1.3 lib
//      |----- map_loader.js

var map;
var mapMarker;

function initializeMap() {

    var defPos = transformToMap(mapLatLng);
    map = new AMap.Map('mapUICanvas',{
        zoom: mapZoom,
        center: defPos,
        lang: mapLang
    });
    mapIsLoaded = true; // Set the flag to let the rest of App know

    var mapMarkerIcon = 'res/img/pin_normal.png';
    var mapMarkerIconDrag = 'res/img/pin_dragging_faded.png';
    var mapMarkerIconDown = 'res/img/pin_normal_faded.png';

    // Add a marker at the center of the map
    mapMarker = new AMap.Marker({
        position: defPos,
        map: map,
        icon: mapMarkerIcon,
        offset: new AMap.Pixel(-11, -30),
        draggable: mapAllowEdit
    });

    // Define custom tools
    var mapUICtlBox = $("#mapUICtl");
    var customTools = {
        dom: mapUICtlBox[0],
        addTo: function() {
            map.getContainer().appendChild(customTools.dom);
        },
        removeFrom: function() {
            if (customTools.dom.parentNode == map.getContainer()) {
                map.getContainer().removeChild(customTools.dom);
            }
        }
    }
    map.addControl(customTools);

    // Show custom tools when the map is ready
    var onComplete = AMap.event.addListener(map, 'complete', function() {
        mapUICtlBox.show();
        mapLoaderFunc.initializeTools();
        AMap.event.removeListener(onComplete);
    });

    // Save the zoom level when map's zoom is changed
    AMap.event.addListener(map, 'zoomend', function() {
        mapZoom = map.getZoom();
    });

    // Because Amap's marker icon offset starts at (0,0) rather than the image center,
    // we have to save the point where the user clicks on the marker and fix it in 'dragend'
    var ptClick;
    AMap.event.addListener(mapMarker, 'mousedown', function(e) {
        mapMarker.setIcon(mapMarkerIconDown);
        var ptMarker = map.lnglatTocontainer(mapMarker.getPosition());
        ptClick = new AMap.Pixel(ptMarker.getX() - e.pixel.getX(), ptMarker.getY() - e.pixel.getY());
        delete ptMarker;
    });
    // Change the marker icon to indicate dragging mode.
    AMap.event.addListener(mapMarker, 'dragstart',  function(e) {
        mapMarker.setIcon(mapMarkerIconDrag);
    });
    AMap.event.addListener(mapMarker, 'mouseup', function(e) {
        mapMarker.setIcon(mapMarkerIcon);
    });

    // Save the new location when the marker's pos changed
    AMap.event.addListener(mapMarker, 'dragend', function(e) {
        // fix lnglat based on ptClick info
        var ptFixed = new AMap.Pixel(e.pixel.getX() + ptClick.getX(), e.pixel.getY() + ptClick.getY());
        var llFixed = map.containTolnglat(ptFixed);
        var lat = llFixed.getLat();
        var lng = llFixed.getLng();
        if (MapCoordSrvc.insideChina(lat, lng)){
            if (MapCoordSrvc.insideTaiwan(lat, lng)){
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
        delete ptFixed;
        delete llFixed;
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
        if (MapCoordSrvc.insideTaiwan(latlng.lat, latlng.lng)){
            return new AMap.LngLat(latlng.lng, latlng.lat);
        } else {
            var gcjPos = MapCoordSrvc.wgs2gcj(latlng.lat, latlng.lng);
            return new AMap.LngLat(gcjPos.lng, gcjPos.lat);
        }
    } else {
        return new AMap.LngLat(latlng.lng, latlng.lat);
    }
}