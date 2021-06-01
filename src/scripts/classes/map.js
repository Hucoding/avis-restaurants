class MyMap {
    constructor(latMap, lngMap){
        this.map = null;
        this.latMap = latMap; 
        this.lngMap = lngMap; 
        this.markers = [];
        this.newRestaurants = [];
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

                this.addRestaurant(mapsMouseEvent.latLng);

            });

        } 
    }

    //récupération de la photo du restau via cette méthode :
    getImgForNewRestaurant(coords, id, index) {

    }

    // création d'une modal pour un nouveau restaurant
    generateModalTemplateForNewRestaurant(object, restaurant, index) {

    }

    //ajout d'un nouveau restaurant sur la carte 
    addRestaurant(coords) {
        //créer des index en auto pour générer des modals différents pour chaque marqueur
        console.log("coords " + coords);
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