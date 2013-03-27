var map = L.map('map').setView([45.808, 15.981], 13);
var radius = 1000;
var GeoJSONLayer;

$(document).ready(function () {

    map.on('load', function(e) {
        requestUpdatedPOI(e.target.getBounds());
    });
    // Odkomentirati za dohvat svih tocaka unutar BBOX-a trenutnog viewa
    //map.on('moveend', function(e) {
    //    requestUpdatedPOI(e.target.getBounds());
    //});
});

L.tileLayer('http://pimpmymaps.org/v2/zagreb/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://pimpmymaps.org">PimpMyMaps</a>',
    maxZoom: 16
}).addTo(map);

function onLocationFound(e) {

    L.marker(e.latlng).addTo(map)
        .bindPopup("Blue: You are within " + e.accuracy / 2 + " m from this point.<br>"
            + "Red circle around point with radius = " + radius + "m"
        ).openPopup();
    L.circle(e.latlng, e.accuracy / 2).addTo(map);
    L.circle(e.latlng, radius,  { color: 'red', fillColor: '#f03', fillOpacity: 0.1,weight: 1 }).addTo(map);

    requestPointInRadius(e.latlng);

}
function onLocationError(e) {
    alert(e.message);
}
map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({setView: true, maxZoom: 14});

function requestPointInRadius(coords) {
    $.ajax(
        {
            type: 'POST',
            url: '/GetPointsInRadius/amenity/' +  coords.lng + ' ' + coords.lat + '/' + radius,
            dataType: 'json',
            data: JSON.stringify(coords),
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
                parseResponsePOI(result);
            },
            error: function (req, status, error) {
                alert('Unable to get POI data');
            }

        });
};

function parseResponsePOI(data) {

    if (GeoJSONLayer != undefined)
    {
        map.removeLayer(GeoJSONLayer);
    }
    L.geoJson(data).addTo(map);
}



