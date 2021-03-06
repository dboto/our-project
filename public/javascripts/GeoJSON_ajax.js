var GeoJSONLayer;

$(document).ready(function () {

    map.on('load', function(e) {
        requestUpdatedPOI(e.target.getBounds());
    });
    map.on('moveend', function(e) {
        requestUpdatedPOI(e.target.getBounds());
    });
});

function requestUpdatedPOI(bounds) {
    $.ajax(
        {
            type: 'POST',
            url: '/GetPointsInBBOX',
            dataType: 'json',
            data: JSON.stringify(bounds),
            contentType: 'application/json; charset=utf-8',
            success: function (result) {
                parseResponsePOI(result);
            },
            error: function (req, status, error) {
                alert('Unable to get data');
            }
        });
};

