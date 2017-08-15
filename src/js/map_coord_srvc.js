
var MapCoordSrvc = {
    PI : 3.14159265358979324,  
    x_pi : 3.14159265358979324 * 3000.0 / 180.0,  
    delta : function (lat, lng) {
        // Krasovsky 1940  
        //  
        // a = 6378245.0, 1/f = 298.3  
        // b = a * (1 - f)  
        // ee = (a^2 - b^2) / a^2;  
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        var dLat = this.transformLat(lng - 105.0, lat - 35.0);  
        var dLng = this.transformLng(lng - 105.0, lat - 35.0);  
        var radLat = lat / 180.0 * this.PI;  
        var magic = Math.sin(radLat);  
        magic = 1 - ee * magic * magic;  
        var sqrtMagic = Math.sqrt(magic);  
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);  
        dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);  
        return {'lat': dLat, 'lng': dLng};  
    },  
    //WGS-84 to GCJ-02  
    wgs2gcj : function (wgsLat, wgsLng) {  
        // if (!this.insideChina(wgsLat, wgsLng))  
        //     return {'lat': wgsLat, 'lng': wgsLng};  
        var d = this.delta(wgsLat, wgsLng);  
        return {'lat' : wgsLat + d.lat,'lng' : wgsLng + d.lng};  
    },  
    //GCJ-02 to WGS-84  
    gcj2wgs : function (gcjLat, gcjLng) {  
        // if (!this.insideChina(gcjLat, gcjLng))
        //     return {'lat': gcjLat, 'lng': gcjLng};      
        var d = this.delta(gcjLat, gcjLng);  
        return {'lat': gcjLat - d.lat, 'lng': gcjLng - d.lng};  
    },  
    //GCJ-02 to WGS-84 exactly  
    gcj2wgs_exact : function (gcjLat, gcjLng) {  
        var initDelta = 0.01;  
        var threshold = 0.000000001;  
        var dLat = initDelta, dLng = initDelta;  
        var mLat = gcjLat - dLat, mLng = gcjLng - dLng;  
        var pLat = gcjLat + dLat, pLng = gcjLng + dLng;  
        var wgsLat, wgsLng, i = 0;  
        while (1) {  
            wgsLat = (mLat + pLat) / 2;  
            wgsLng = (mLng + pLng) / 2;  
            var tmp = this.gcj_encrypt(wgsLat, wgsLng)  
            dLat = tmp.lat - gcjLat;  
            dLng = tmp.lng - gcjLng;  
            if ((Math.abs(dLat) < threshold) && (Math.abs(dLng) < threshold))  
                break;  
            if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;  
            if (dLng > 0) pLng = wgsLng; else mLng = wgsLng;  
   
            if (++i > 10000) break;  
        }  
        return {'lat': wgsLat, 'lng': wgsLng};  
    },  
    //GCJ-02 to BD-09  
    gcj2bd : function (gcjLat, gcjLng) {  
        var x = gcjLng, y = gcjLat;    
        var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);    
        var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);    
        bdLng = z * Math.cos(theta) + 0.0065;    
        bdLat = z * Math.sin(theta) + 0.006;   
        return {'lat' : bdLat,'lng' : bdLng};  
    },  
    //BD-09 to GCJ-02  
    bd2gcj : function (bdLat, bdLng) {  
        var x = bdLng - 0.0065, y = bdLat - 0.006;    
        var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);    
        var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);    
        var gcjLng = z * Math.cos(theta);    
        var gcjLat = z * Math.sin(theta);  
        return {'lat' : gcjLat, 'lng' : gcjLng};
    },
    //BD-09 to WGS-84
    bd2wgs : function (bdLat, bdLng) {
        if (this.insideChina(bdLat, bdLng)){
            var gcj = this.bd2gcj(bdLat, bdLng);
            return this.gcj2wgs(gcj.lat, gcj.lng);
        } else {
            return {'lat' : bdLat, 'lng' : bdLng};
        }
    },
    //WGS-84 to BD-09
    wgs2bd : function (wgsLat, wgsLng) {
        if (this.insideChina(wgsLat, wgsLng)){
            var gcj = this.wgs2gcj(wgsLat, wgsLng);
            return this.gcj2bd(gcj.lat, gcj.lng);
        } else {
            return {'lat' : wgsLat, 'lng' : wgsLng};
        }
    },
    // two point's distance  
    distance : function (latA, lngA, latB, lngB) {  
        var earthR = 6371000.;  
        var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lngA - lngB) * this.PI / 180);  
        var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);  
        var s = x + y;  
        if (s > 1) s = 1;  
        if (s < -1) s = -1;  
        var alpha = Math.acos(s);  
        var distance = alpha * earthR;  
        return distance;  
    },  
    insideChina : function (lat, lng) {  
        // including Taiwan and South China Sea
        var plyChina = [ 
            [97.03125, 43.389082], 
            [87.890625, 49.837982], 
            [78.398438, 45.336702], 
            [78.574219, 43.068888],
            [72.421875, 39.027719],
            [77.783203, 34.741612],
            [77.519531, 31.952162],
            [80.507813, 29.53523],
            [81.958008, 30.031055],
            [86.000977, 27.916767],
            [88.769531, 27.25463],
            [90.395508, 27.877928],
            [91.845703, 27.683528],
            [96.020508, 28.998532],
            [98.701172, 26.588527],
            [97.470703, 24.246965],
            [98.920898, 22.105999],
            [100.986328, 21.0845],
            [105.292969, 22.958393],
            [107.797852, 21.166484],
            [107.578125, 18.39623],
            [111.005859, 13.197165],
            [114.213867, 7.754537],
            [117.993164, 9.925566],
            [119.575195, 19.766704],
            [124.628906, 23.362429],
            [124.145508, 39.53794],
            [126.826172, 41.178654],
            [130.869141, 42.488302],
            [135.131836, 48.04871],
            [130.297852, 49.124219],
            [124.936523, 53.800651],
            [120.498047, 53.46189],
            [116.455078, 50.148746],
            [114.125977, 46.437857],
            [108.588867, 43.261206]
        ];
        return (this.insidePolygon([lng, lat], plyChina));
    },
    // For use in fixing Google Map coordinates
    insideSAR : function (lat, lng) {
        var inside = false;
        var plyHongkong = [ 
            [114.008904, 22.51002], 
            [114.054909, 22.501773], 
            [114.086838, 22.531902], 
            [114.120483, 22.532537],
            [114.166832, 22.559489],
            [114.214897, 22.555367],
            [114.23069, 22.540464],
            [114.248543, 22.552513],
            [114.353085, 22.566449],
            [114.482346, 22.423089],
            [114.45179, 22.142479],
            [113.947449, 22.128581],
            [113.827972, 22.179139],
            [113.788147, 22.279566],
            [113.888397, 22.41928]
        ];
        inside = (this.insidePolygon([lng, lat], plyHongkong));
        if (!inside) {
            var plyMacau = [ 
                [113.531985, 22.21351], 
                [113.541427, 22.213113], 
                [113.544302, 22.217086], 
                [113.550568, 22.216689],
                [113.581553, 22.559489],
                [113.609962, 22.131284],
                [113.568764, 22.098046],
                [113.547735, 22.111406],
                [113.548508, 22.144164],
                [113.540998, 22.153662],
                [113.526621, 22.18359],
                [113.533831, 22.204809]
            ];
            inside = (this.insidePolygon([lng, lat], plyMacau));
        }
        return inside;
    },
    insideTaiwan : function (lat, lng) {
        var plyTaiwan = [ 
            [121.069336, 25.710837], 
            [118.795166, 23.63446], 
            [120.289307, 21.074249], 
            [121.794434, 21.820708],
            [122.607422, 25.413509]
        ];
        return (this.insidePolygon([lng, lat], plyTaiwan));
    },
    insidePolygon : function (point, vs) {
        var x = point[0], y = point[1];
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },
    transformLat : function (x, y) {  
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));  
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;  
        ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;  
        ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;  
        return ret;  
    },  
    transformLng : function (x, y) {  
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));  
        ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;  
        ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;  
        ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;  
        return ret;  
    }  
};