class User {
    constructor(lat, lng){
        this.lat = lat; 
        this.lng = lng; 
    }

    /* addUserMarker() {
        // Add user markers on the map 
        userMarker.map((coords) => {
            let coordsFromArray = JSON.stringify(coords);
            let parsedCoordsPosition = JSON.parse(coordsFromArray);

            console.log("latitude MARQUEUR " + parsedCoordsPosition.lat);
            console.log("longitude MARQUEUR " + parsedCoordsPosition.lng);

            let markerUserCoords = new google.maps.LatLng(
                parsedCoordsPosition.lat, 
                parsedCoordsPosition.lng
            );

            let markers = new google.maps.Marker({
                map: map, 
                position: markerUserCoords,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }
            });
        });
    } */
}