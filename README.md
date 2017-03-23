# MagicEXIF GPS Picker

GitHub Project: [MagicEXIF-GPS-Picker](https://github.com/charonchan1991/MagicEXIF-GPS-Picker/)

This ia a GPS coordinates picker webapp for [MagicEXIF](http://www.magicexif.com/) and [ExifNow](http://www.exifnow.com/). Google, Baidu, Amap (Gaode), Yandex and Leaflet-based maps are all supported. Coordinates are automatically corrected to WGS-84 from BD-09 for Baidu or GCJ-02 for Google China and Amap.

## Highlights

+ Based on URL query params, super easy to use and configure
+ Easily switch among Google Maps, Baidu Map (百度地图), Amap (高德地图), Yandex Maps, and other Leaflet-based public map tiles such as OpenStreetMap, Carto and Mapbox.
+ Automatic datum conversion with high precision between WGS-84, GCJ-02, and BD-09.
+ Consistent UI components for all maps

## Usage

Run in a http server. Try play with the following params:

| param    | required | default  | description |
| -------- | -------- | -------- | ----------- |
| agent    | yes      |          | Request origin. Only 'MgExf' and 'ExfNw' is allowed. |
| provider | no       | 'google' | Map service provider. Can be one of the following: ['google', 'google_cn', 'baidu', 'amap', 'yandex', 'osm', 'mapbox', 'carto', 'esri', 'wikimedia']. |
| lang     | no       |          | Set the map language, if applicable. Only Google, Amap, and Yandex provide multi-language support so far. |
| lat      | no       | 0        | Default latitude. |
| lng      | no       | 0        | Default longitude. |
| zoom     | no       | 4        | Default zoom level. |
| edit     | no       | 0        | If set to 1, updating GPS coordinates is allowed. |
