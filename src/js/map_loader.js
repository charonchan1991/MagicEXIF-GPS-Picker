// Map component for ExifNow & MagicEXIF | (c) 2017 Ziyao Chen

// GLOBAL: Get params and initialize all global variables
var mapProvider = $.query.get('provider');
var mapAgent = $.query.get('agent');
var mapLang = $.query.get('lang');
var mapLatLng = {lat: Number($.query.get('lat')), lng: Number($.query.get('lng'))};
var mapOriginalLatLng = $.extend(true, {}, mapLatLng);
var mapZoom = Number($.query.get('zoom'));
var mapAllowEdit = Boolean($.query.get('edit'));

var mapIsLoaded = false;
var mapPosChanged = false;
var mapLoaderFunc;

// Start when the DOM is ready
$(function() {

    // Clean up the params if necessary
    if(mapProvider.length == 0){mapProvider = 'google';}
    if(mapZoom == 0){mapZoom = 4;}
    switch(mapAgent){
    case 'MgExf':
    case 'ExfNw':
        // Load the map based on the selected provider
        if (!mapIsLoaded) {
            mapLoaderFunc = loadMapFromProvider(mapProvider, mapLang);
        }
        break;
    default:
        // Unauthorized access to the app
        $('#mapUIMsg').html('Unexpected Agent');
    }
});

function loadMapFromProvider(provider, lang){

    var mapUICtlBtnConfirm = $("#mapUICtlConfirm");
    var mapUICtlBtnRestore = $("#mapUICtlRestore");

    // Get loader info from provider string
    var mapLoaderObj = getMapSrvcLibr(provider, lang);
    if (mapLoaderObj.loaderJS.length > 0){
        // Load the loader
        $.getScript('res/js/map_coord_srvc.js', function(){
            $.getScript(mapLoaderObj.loaderJS, function(data, status, xhr){
                if (xhr.status == 200){
                    // Now, fetch the map API library which will evoke the callback of the loader
                    $.getScript(mapLoaderObj.apiLib, function(data, status, xhr){
                        if (xhr.status == 200){
                            // Map has been loaded via callback except for Leaflet
                            if(mapLoaderObj.alias=='lfl'){
                                // Append Leaflet css and initialize the map
                                $('<link/>', {
                                    rel: "stylesheet",
                                    type: "text/css",
                                    href: "res/css/leaflet.1.0.3.css"
                                }).appendTo("head");
                                initializeMap(provider.toLowerCase());
                            };
                        } else {
                            // might indicate a server problem or loss of connection
                            $('#mapUIMsg').html('Map Service Not Responding');
                        }
                    });
                } else {
                    // Failed to fecth loader js file, shoundn't happen
                    $('#mapUIMsg').html('Internal Error');
                }
            });
        });
    } else {
        $('#mapUIMsg').html('Provider Not Supported');
    }
    
    // Get the map library and the loader js path from provider's host
    function getMapSrvcLibr(provider, lang){
        var targetLoader = '';
        var targetApiLibr = '';
        var prvdrAlias = '';
        switch(provider.toLowerCase()){
        case 'google':
        case 'google_cn':
            prvdrAlias = 'goo';
            targetLoader = 'res/js/map_loader_google.js';
            targetApiLibr = (provider == 'google_cn' ? 'http://maps.google.cn/' : 'https://maps.googleapis.com/') + 
                        'maps/api/js?key=AIzaSyB4DUevvypCjQ8gsUj846Pyv-3Ys11-XII&callback=initializeMap';
            if (lang.length > 0) {targetApiLibr += '&language=' + lang;}
            break;
        case 'baidu':
            prvdrAlias = 'bd';
            targetLoader = 'res/js/map_loader_baidu.js';
            targetApiLibr = 'https://api.map.baidu.com/api?v=2.0&ak=izDTGnjdI3PrIpxBbno664nhOzgIg5Nw&s=1&callback=initializeMap';
            break;
        case 'amap':
        case 'gaode':
            prvdrAlias = 'amp';
            targetLoader = 'res/js/map_loader_amap.js';
            targetApiLibr = 'https://webapi.amap.com/maps?v=1.3&key=6405f9ee601bdcbe4182e53cd20e61fa&callback=initializeMap';
            break;
        case 'yandex':
            // lang is a mandatory param for yandex
            if (lang.length == 0) {lang = 'en_RU';}
            prvdrAlias = 'ydx';
            targetLoader = 'res/js/map_loader_yandex.js';
            targetApiLibr = 'https://api-maps.yandex.ru/2.1/?load=Map,Placemark,collection.Item,util.augment&onload=initializeMap&lang=' + lang;
            break;
        case 'osm':
        case 'openstreetmap':
        case 'mapbox':
        case 'bright':
        case 'dark':
        case 'wiki':
        case 'wikimedia':
        case 'carto':
        case 'cartodb':
        case 'esri':
        case 'arcgis':
        case 'google_lfl':
        case 'google_lfl_cn':
        case 'google_stl':
        case 'google_stl_cn':
            prvdrAlias = 'lfl';
            targetLoader = 'res/js/map_loader_leaflet.js';
            targetApiLibr = 'res/js/leaflet.1.0.3.min.js';
            break;
        }
        return {
            apiLib: targetApiLibr,
            loaderJS: targetLoader,
            alias: prvdrAlias
        };
    }

    // Set custom tools behavior
    function initializeTools(){
        if (mapIsLoaded) {
            var tipOpt = {
                anchor: 'e',
                delay: 0,
                offset: 0
            };
            mapUICtlBtnConfirm.miniTip(tipOpt);
            mapUICtlBtnRestore.miniTip(tipOpt);
            mapUICtlBtnConfirm.click(applyNewPosition);
            mapUICtlBtnRestore.click(cancelEdit);
        }
    }
    
    // Apply new position and update query params
    function applyNewPosition(){
        if(history.pushState && mapPosChanged){
            var suffix = '#applyClicked';
            if (mapAllowEdit) {
                moveMarkerTo(mapLatLng);
                mapOriginalLatLng = $.extend(true, {}, mapLatLng);
                mapUICtlBtnConfirm.removeClass('active');
                mapUICtlBtnRestore.removeClass('active');
                mapPosChanged = false;
            } else {
                cancelEdit();
            }
            var winLoc = window.location;
            var newUrl = winLoc.protocol + "//" +winLoc.host + winLoc.pathname +
                                            '?agent=' + mapAgent +
                                            '&provider=' + mapProvider + 
                                            '&edit=' + Number(mapAllowEdit) +
                                            '&lat=' + mapLatLng.lat +
                                            '&lng=' + mapLatLng.lng +
                                            '&zoom=' + mapZoom;
            if (mapLang.length > 0) {newUrl+='&lang=' + mapLang}
            window.history.replaceState({path:newUrl}, '', newUrl + suffix);
        }
    }
    
    function cancelEdit(){
        if (mapPosChanged) {
            mapLatLng = $.extend(true, {}, mapOriginalLatLng);
            moveMarkerTo(mapOriginalLatLng);
            mapUICtlBtnConfirm.removeClass('active');
            mapUICtlBtnRestore.removeClass('active');
            mapPosChanged = false;
        }
    }

    function enableEdit(){
        mapUICtlBtnConfirm.addClass('active');
        mapUICtlBtnRestore.addClass('active');
        mapPosChanged = true;
    }

    return {
        enableEdit: enableEdit,
        cancelEdit: cancelEdit,
        applyNewPosition: applyNewPosition,
        initializeTools: initializeTools
    };
}