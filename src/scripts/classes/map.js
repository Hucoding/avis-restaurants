class MyMap {
    constructor(latMap, lngMap){
        this.map = null;
        this.latMap = latMap; 
        this.lngMap = lngMap; 
    }

    initMap(latMap, lngMap) {

        if(latMap != undefined && lngMap != undefined) {

            let initCoords = new google.maps.LatLng(latMap, lngMap);
            let initZoom = 15;

            console.log(initCoords);

           $(function initMap () {
                this.map = new google.maps.Map(document.getElementById("map"), {
                    zoom: initZoom,
                    center: initCoords,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                //récupérer photo d'une position clickée


                this.map.addListener("click", (mapsMouseEvent) => {
                    let marker = new google.maps.Marker({
                        position: mapsMouseEvent.latLng,
                        title: 'Nouveau restaurant',
                        map: this.map,
                        draggable: true
                    });

                    //image récupérer dans la console reste plus qu'a afficher la photo du restau proprement dans une modal
                    var panorama = new google.maps.StreetViewPanorama(document.getElementById('#TEST'), {
                        position: mapsMouseEvent.latLng,
                        pov: {
                            heading: 34,
                            pitch: 10,
                            zoom: 1
                        }
                    });

                    console.log(mapsMouseEvent.latLng);

                    var latlng = panorama.getPosition();
                    var pov = panorama.getPov();
                    var url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + encodeURIComponent(latlng.lat() + ", " + latlng.lng()) + "&fov=" + (180 / Math.pow(2, pov.zoom)) +  "&heading=" + encodeURI(pov.heading) + "&pitch=" + encodeURI(pov.pitch) + "&key=AIzaSyC-ZtycdNkeRoLzI4qk6PF4NjyeOofDjS4";
                    console.log("lat: " + latlng.lat() + "     " + "lng: " + latlng.lng());
                    console.log("img src: " + url);

                    return marker;
                });

                console.log("ALL MARKERS TABLE : " + allMarkers);

                /*** Add restaurants markers on the map ***/
                allMarkers.map((coords, index) => {
                    let coordsFromArray = JSON.stringify(coords);
                    let parsedCoordsPosition = JSON.parse(coordsFromArray);

                    console.log("latitude MARQUEUR " + parsedCoordsPosition.lat);
                    console.log("longitude MARQUEUR " + parsedCoordsPosition.lng);

                    let markerCoords = new google.maps.LatLng(
                        parsedCoordsPosition.lat, 
                        parsedCoordsPosition.lng
                    );

                    let markers = new google.maps.Marker({
                        map: this.map, 
                        position: markerCoords
                    });

                    let restauIndex = index+1;
        
                    markers.addListener("click", () => {
                        $('#restaurantDetails'+restauIndex).modal('show'); 
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
                        map: this.map, 
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

    // Sets the map on all markers in the array.
    setMapOnAll() {
        for (let i = 0; i < allMarkers.length; i++) {
            console.log('ALLMARKERS =>' + allMarkers);
            allMarkers[i].setMap(this.map);
        }
    }
    
    // Removes the markers from the map, but keeps them in the array.
    clearMarkers() {
        console.log('CLEAR MARKERS METHOD');
        this.setMapOnAll(null);
    }

    deleteMarkers() {
        console.log('TEST DELETE MARKERS ');
        this.clearMarkers();
    }

}