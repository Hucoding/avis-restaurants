class MyMap {
    constructor(latMap, lngMap){
        this.latMap = latMap; 
        this.lngMap = lngMap; 
    }

    initMap(latMap, lngMap) {

        if(latMap != undefined && lngMap != undefined) {
            console.log("latitude reçue : " + latMap);
            console.log("longitude reçue : " + lngMap);

            let initCoords = new google.maps.LatLng(latMap, lngMap);
            let initZoom = 15;

            console.log(initCoords);

           $(function initMap () {
                map = new google.maps.Map(document.getElementById("map"), {
                    zoom: initZoom,
                    center: initCoords,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                console.log("ALL MARKERS TABLE : " + allMarkers);

                /*** Add restaurants markers on the map ***/
                allMarkers.map((coords) => {
                    let coordsFromArray = JSON.stringify(coords);
                    let parsedCoordsPosition = JSON.parse(coordsFromArray);

                    console.log("latitude MARQUEUR " + parsedCoordsPosition.lat);
                    console.log("longitude MARQUEUR " + parsedCoordsPosition.lng);

                    let markerCoords = new google.maps.LatLng(
                        parsedCoordsPosition.lat, 
                        parsedCoordsPosition.lng
                    );

                    let markers = new google.maps.Marker({
                        map: map, 
                        position: markerCoords
                    });
                });

                /** Add user markers on the map  **/
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


               // à créer de facon factorisable <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC-ZtycdNkeRoLzI4qk6PF4NjyeOofDjS4"></script>

            });
        } 
    }
}