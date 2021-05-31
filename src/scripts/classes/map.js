class MyMap {
    constructor(latMap, lngMap){
        this.map = null;
        this.latMap = latMap; 
        this.lngMap = lngMap; 
        this.markers = [];
    }

    initMap(latMap, lngMap) {

        if(latMap != undefined && lngMap != undefined) {

            let initCoords = new google.maps.LatLng(latMap, lngMap);
            let initZoom = 15;

            this.map = new google.maps.Map(document.getElementById("map"), {
                zoom: initZoom,
                center: initCoords,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            //récupérer photo d'une position clickée
            this.map.addListener("click", (mapsMouseEvent) => {

                const marker = new google.maps.Marker({
                    position: mapsMouseEvent.latLng,
                    title: 'Nouveau restaurant',
                    map: this.map,
                    draggable: false
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

                var latlng = panorama.getPosition();
                var pov = panorama.getPov();
                var url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + encodeURIComponent(latlng.lat() + ", " + latlng.lng()) + "&fov=" + (180 / Math.pow(2, pov.zoom)) +  "&heading=" + encodeURI(pov.heading) + "&pitch=" + encodeURI(pov.pitch) + "&key=AIzaSyC-ZtycdNkeRoLzI4qk6PF4NjyeOofDjS4";
                console.log("lat: " + latlng.lat() + "     " + "lng: " + latlng.lng());
                //console.log("img src: " + url);

            });

        } 
    }

    //ajout d'un nouveau restaurant sur la carte 
    addRestaurant() {
        
    }

    //ajout d'un avis sur un restaurant
    addAdvice() {

    }

    addMarker(coords, type) {

        if(type == true) {
            const marker = new google.maps.Marker({
                map: this.map, 
                position: coords,
                icon: {
                    url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                }
            }); 
            this.markers.push(marker);
            return marker; 
        } else {
            const marker = new google.maps.Marker({
                map: this.map, 
                position: coords
            });
            this.markers.push(marker);
            return marker;
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
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
    }

    deleteMarkers() {
        this.clearMarkers();
    }

}