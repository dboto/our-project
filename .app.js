
/**
 * Module dependencies.
 */

var express = require('express')
  , pg = require('pg').native
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');


var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/GetPointsInRadius/:key/:coord/:radius', function(req,res){
    RetrivePointsInRadius(req.params, res);
});

function RetrivePointsInRadius(filter, res){
    var connString = 'tcp://dboto@localhost/osm';
    pg.connect(connString, function(err, client, done) {
        var sql = 'SELECT ST_AsText(way),name,' + filter.key + ' FROM planet_osm_point WHERE ST_DWithin(planet_osm_point.way , ST_Transform(ST_GeomFromText(\'Point(' + filter.coord + ')\', 900913), 4326), ' + filter.radius + ') AND name is not null AND ' + filter.key +' is not null;';
        client.query(sql, function(err, result) {
            console.log(result);
            res.send(result);
        });
    });
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
