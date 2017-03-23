// Dependencies: 
//      |----- leafletJS v1.0.3 apis lib
//      |----- map_loader.js

var map;
var mapMarker;

function initializeMap(provider) {

    var defPos = mapLatLng;
    map = L.map('mapUICanvas', {
        zoomControl: false
    }).setView(defPos, mapZoom);
    
    var osmString = 'Map data &copy; <a href="http://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';
    var lflString = ' | powered by <a href="http://leafletjs.com" target="_blank">Leaflet</a>';
    switch(provider){
    case 'mapbox':
    case 'bright':
    case 'dark':
        var isRoadmap = (provider == 'mapbox');
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: osmString + ', Imagery &copy <a href="http://mapbox.com" target="_blank">Mapbox</a>' + lflString,
            maxZoom: ( isRoadmap ? 18 : 11),
            minZoom: ( isRoadmap ? 0 : 1),
            id: ( isRoadmap ? 'mapbox.streets' : 'mapbox.world-' + provider),
            accessToken: 'pk.eyJ1IjoiY2hhcm9uY2hhbjE5OTEiLCJhIjoiY2owZzByNzN0MDJjeTMzcmt5em5jYjhnZyJ9.xP7ewkleFDn1rPbb_83K6A'
        }).addTo(map);
        break;
    case 'wiki':
    case 'wikimedia':
        L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png', {
            maxZoom: 18,
            id: 'wikipedia-map-01',
            attribution: osmString + ', Imagery &copy <a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use" target="_blank">Wikimedia</a>' + lflString
        }).addTo(map);
        break;
    case 'carto':
    case 'cartodb':
        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: osmString + ', Imagery &copy <a href="https://carto.com/attribution" target="_blank">CARTO</a>' + lflString
        }).addTo(map);
        break;
    case 'esri':
    case 'arcgis':
        L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}', {
            variant: 'World_Street_Map',
            attribution: 'Map data & Imagery &copy <a href="http://www.esri.com/" target="_blank">ESRI</a>' + lflString
        }).addTo(map);
        break;
    case 'google_lfl':
        L.tileLayer('https://maps.googleapis.com/maps/vt?lyrs=m@189&x={x}&y={y}&z={z}', {
            maxZoom: 18,
            attribution: 'Map data & Imagery &copy <a href="http://www.google.com/" target="_blank">Google</a>' + lflString
        }).addTo(map);
        break;
    case 'google_lfl_cn':
        L.tileLayer('http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}', {
            maxZoom: 18,
            attribution: 'Map data & Imagery &copy <a href="http://www.google.com/" target="_blank">Google</a>' + lflString
        }).addTo(map);
        break;
    default:
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: osmString + lflString
        }).addTo(map);
    }
    mapIsLoaded = true;

    // Save the zoom level when map's zoom is changed
    map.on('zoomend', function(e) {
        mapZoom = map.getZoom();
    });

    // Load marker icon resources
    var mapMarkerIcon = L.icon({
        iconUrl: 'res/img/pin_normal.png',
        iconSize:     [22, 38], 
        iconAnchor:   [11, 30]
    });
    // Leaflet does not support chaning icon on dragstart
    // var mapMarkerIconDrag = L.icon({
    //     iconUrl: 'res/img/pin_dragging.png',
    //     iconSize:     [22, 38], 
    //     iconAnchor:   [11, 30]
    // });
    
    mapMarker = L.marker(defPos, {
        icon: mapMarkerIcon,
        draggable: mapAllowEdit
    }).addTo(map);

    // Define custom tools
    var customTools = L.Control.extend({
        options: {
            position: 'topleft' 
        },
        onAdd: function (map) {
            var mapUICtlBox = $("#mapUICtl");
            mapUICtlBox.show();
            return mapUICtlBox[0];
        }
    });
    // Add it to the map
    map.addControl(new customTools());
    mapLoaderFunc.initializeTools();

    // Change the marker icon to indicate dragging mode
    mapMarker.on('mousedown', function(e){
        mapMarker.setOpacity(0.6);
    }).on('mouseup', function(e){
        mapMarker.setOpacity(1.0);
    }).on('dragend', function(e){
        mapLatLng.lat = e.target.getLatLng().lat;
        mapLatLng.lng = e.target.getLatLng().lng;
        mapMarker.setOpacity(1.0);
        mapLoaderFunc.enableEdit();
    });

}

function moveMarkerTo(newPos){
    mapMarker.setLatLng(newPos);
    map.panTo(newPos);
}
