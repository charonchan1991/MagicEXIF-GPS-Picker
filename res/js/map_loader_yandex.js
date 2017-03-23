// Dependencies: 
//      |----- yandex map javascript v2.1 apis lib
//      |----- map_loader.js

var map;
var mapMarker;

function initializeMap() {

    var defPos = [mapLatLng.lat, mapLatLng.lng];
    map = new ymaps.Map('mapUICanvas', {
        center: defPos,
        zoom: mapZoom
    });
    mapIsLoaded = true; // Set the flag to let the rest of App know
    
    var mapMarkerIcon = 'res/img/pin_normal.png';
    var mapMarkerIconDrag = 'res/img/pin_dragging_faded.png';
    var mapMarkerIconDown = 'res/img/pin_normal_faded.png';
    mapMarker = new ymaps.Placemark(defPos, {}, {
        draggable: mapAllowEdit,
        iconLayout: 'default#image',
        iconImageHref: mapMarkerIcon,
        iconImageSize: [22, 38],
        // The offset of the upper left corner of the icon relative to the anchor point
        iconImageOffset: [-11, -30]
    });
    map.geoObjects.add(mapMarker);

    // Create a class for the custom toolbox
    CustomTools = function (options) {
        CustomTools.superclass.constructor.call(this, options);
        this._$content = null;
    };
    // Inherit it from collection.Item
    ymaps.util.augment(CustomTools, ymaps.collection.Item, {
        onAddToMap: function (map) {
            CustomTools.superclass.onAddToMap.call(this, map);
            this.getParent().getChildElement(this).then(this._onGetChildElement, this);
        },
        onRemoveFromMap: function (oldMap) {
            CustomTools.superclass.onRemoveFromMap.call(this, oldMap);
        },
        _onGetChildElement: function (parentDomContainer) {
            var mapUICtlBox = $("#mapUICtl");
            this._$content = mapUICtlBox.appendTo(parentDomContainer);
            mapUICtlBox.show();
        }
    });
    var customTools = new CustomTools();
    map.controls.add(customTools, {
        float: 'none',
        position: {
            top: 0,
            left: 0
        }
    });
    mapLoaderFunc.initializeTools();

    // Yandex does not provide anything like a zoom_changed event, so we have to make our own
    map.events.add('actiontickcomplete', function(e) {
        switch(e.originalEvent.tick.timingFunction){
        case 'ease-in':
        case 'ease-out':
            // Save the zoom level when map's zoom is changed
            mapZoom = e.originalEvent.tick.zoom;
            break;
        }
    });

    // Change the marker icon to indicate dragging mode
    mapMarker.events.add('mousedown', function(e) {
        mapMarker.options.set('iconImageHref', mapMarkerIconDown);
    });
    mapMarker.events.add('dragstart', function(e) {
        mapMarker.options.set('iconImageHref', mapMarkerIconDrag);
    });
    mapMarker.events.add('mouseup', function(e) {
        mapMarker.options.set('iconImageHref', mapMarkerIcon);
    });

    // Save the new location when the marker's pos changed
    mapMarker.events.add('dragend', function(e) {
        mapMarker.options.set('iconImageHref', mapMarkerIcon);
        mapLatLng.lat = mapMarker.geometry.getCoordinates()[0];
        mapLatLng.lng = mapMarker.geometry.getCoordinates()[1];
        mapLoaderFunc.enableEdit();
    });
}

function moveMarkerTo(newPos){
    var newLatLng = [newPos.lat, newPos.lng];
    mapMarker.geometry.setCoordinates(newLatLng);
    map.panTo(newLatLng);
}