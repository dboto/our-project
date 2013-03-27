var express = require('express');
var pg = require('pg').native;
var http = require('http');

var app = express();

// Configuration

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

app.set('view options', {
    layout: false
});

//Routes
app.get('/', function(req, res){
    res.render('map', {title:'our-project'
    });
});

app.post('/GetPointsInBBOX', function(req, res){
    PointsInBBOX(req.body, res);
});


app.post('/GetPointsInRadius/:key/:coord/:radius', function(req, res){
    GetPointsInRadius(req.params, res);
})

// TODO presloziti kod u skladu Routes logikom

// Funkcija dohvaca sve tocke unutar definiranog radiusa trenutne pozicije klijenta
function GetPointsInRadius(filter, res){

    var connString = 'tcp://dboto@localhost/osm';
    pg.connect(connString, function(err, client, done) {

        var sql = 'SELECT ST_AsGeoJson(ST_Transform(way,4326)) as geometry FROM planet_osm_point WHERE ST_DWithin(planet_osm_point.way , ST_Transform(ST_GeomFromText(\'Point(' + filter.coord + ')\', 4326), 900913), ' + filter.radius + ') AND name is not null AND ' + filter.key + ' is not null;';
        //console.log(sql);
        client.query(sql, function(err, result) {
            var featureCollection = new PoiCollection(result.rows);
            res.send(featureCollection);
            done();
        });
    });
}
// Funkcija dohvaca sve tocke unutar BBOX-a trenutnog viewa na karti
function PointsInBBOX(filter, res){

    var connString = 'tcp://dboto@localhost/osm';
    pg.connect(connString, function(err, client, done) {
	
	// Hardcodirano - vrijednost varijabli "key" i "tag" ce se slati sa klijenta
        var key = "amenity";
        var tag = "restaurant";

        var bounding_box = [
            filter._southWest.lng, filter._southWest.lat,
            filter._northEast.lng, filter._northEast.lat
        ].join(",");

        var sql = "SELECT ST_AsGeoJson(ST_Transform(way,4326)) as geometry FROM planet_osm_point WHERE " + key + " = \'" + tag +"\' AND ST_Intersects(way,(ST_Transform(ST_MakeEnvelope(" + bounding_box +",4326),900913)))";

        client.query(sql, function(err, result) {
            var featureCollection = new PoiCollection(result.rows);
            res.send(featureCollection);
            done();
        });
    });
}

// GeoJSON Feature Collection
function PoiCollection(rows){
    var objGeoJSON, i;
    objGeoJSON = {
        type: "Feature",
        features: []
    };

    for (i = 0; i < rows.length; i++) {
        var item, feature, geometry;
        item = rows[i];
        geometry = JSON.parse(item.geometry);
        delete item.geometry;

        feature = {
            type: "Feature",
            properties: item,
            geometry: geometry
        }
        objGeoJSON.features.push(feature);
    }
    return objGeoJSON;
}

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
