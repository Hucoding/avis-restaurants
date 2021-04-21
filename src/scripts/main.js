let global = {
    data: {
        title : "Avis restaurant",
    },
    constante: {
        firstTitle: $("#title")
    },
    methods: {

        loadScript() {
            let mapScript = document.createElement('script');
            mapScript.type = 'text/javascript';
            mapScript.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "";
            document.body.append(mapScript);   
        },

        filterRatings(ratingsAverage) {
            $(document).ready(function() {
                $("#slider-range").slider({
                    range: true,
                    min: 0,
                    max: 5,
                    values: [2, 4],
                    slide: function(event, ui) {
                        $("#amount").val(ui.values[0] + " - " + ui.values[1]);
                        if(ui.values[0] >= ratingsAverage || ui.values[1] <= ratingsAverage) {
                           console.log(ui.values[0] + " - " + ui.values[1]);
                           console.log("supprimer la liste et afficher les restaurants correspondant");
                           
                        }
                    }
                });
                $("#amount").val($("#slider-range").slider("values", 0) + " - " + $("#slider-range").slider("values", 1));
            });
        },

        /* get choice of user location and add marker or display default places */
        //on passe la position à l'utilisateur puis on ajoute son marqueur avec une fonction addUserMarker() dans l'objert User
        getGeolocationUserPermission() {
            /* let scriptMap = document.createElement("script");
            scriptMap.src = 'https://maps.googleapis.com/maps/api/js?key='+apiKey+'';
            $("#footerScript").append(scriptMap); */
            console.log("géoloc");
            if(navigator.geolocation) {
                console.log("navigator.geolocation :" + navigator.geolocation);
                navigator.geolocation.getCurrentPosition( function(position) {
                    console.log("position :" + position);
                    let positionLat = position.coords.latitude;
                    let positionLng = position.coords.longitude;

                    let coordsUser = new google.maps.LatLng(positionLat, positionLng);

                    userMarker.push(coordsUser);

                    console.log("userMarker" + userMarker);

                    const mapGoogle = new MyMap(positionLat, positionLng);
                    mapGoogle.initMap(positionLat, positionLng);
                     
                } /*, error => {
                    console.error(error);
                    let positionLat = 48.856614;
                    let positionLng = 2.3522219;
                    
                    // if the user decline the location display the default marker in Paris 
                    let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);
    
                    userMarker.push(defaultUserCoords);
                    console.log("MARQUEUR PAR DEFAUT PARIS:" + userMarker);
    
                    const mapGoogle = new GoogleMap(positionLat, positionLng);
                    mapGoogle.initMap(positionLat, positionLng);
                }, {
                  timeout: 1000,
                  maximumAge: 10000,
                  enableHighAccuracy: true
                }*/);
            } else {
                let positionLat = 48.856614;
                let positionLng = 2.3522219;
                
                // if the user decline the location display the default marker in Paris 
                let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);

                userMarker.push(defaultUserCoords);
                console.log("MARQUEUR PAR DEFAUT PARIS:" + userMarker);

                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);

            }
        },

        /* display the restaurants cards near the user */
        displayRestaurantsCardsNearUserFromJSON() {
            services.getData("./assets/json/restaurants.json")
            .then((data) => {

                global.data.restaurants = data;
                
                for( var i = 0; i < global.data.restaurants.length; i++) {

                    const restaurantsJSON = new RestaurantsJSON(
                        global.data.restaurants[i].name, 
                        global.data.restaurants[i].photo, 
                        global.data.restaurants[i].address, 
                        global.data.restaurants[i].lat, 
                        global.data.restaurants[i].lng, 
                        global.data.restaurants[i].ratings, 
                        global.data.restaurants[i].comment
                    );

                    /* template of restaurant cards at the right of map  */
                    let restaurantCardsTemplate =  
                    `<button type="button" data-toggle="modal" data-target="#restaurantDetails${i+1}">
                        <div class="card mb-3 cardOfRestau" style="max-width: 540px;">
                            <div class="row g-0">
                                <div class="col-md-4">
                                <img src=${global.data.restaurants[i].photo} alt="photo restaurant" class="cardImg">
                                </div>
                                <div class="col-md-8">
                                <div class="card-body cardBody">
                                    <h5 class="card-title">${global.data.restaurants[i].restaurantName}</h5>
                                    <p class="card-text">${global.data.restaurants[i].address}</p>
                                    <p class="card-text"><small class="text-muted">${restaurantsJSON.displayAverage(global.data.restaurants[i])}</small></p>
                                </div>
                                </div>
                            </div>
                        </div>
                    </button>`;

                    let modalTemplate = 
                    `<div id="restaurantDetails${i+1}" class="modal fade">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                    
                                <!-- Header -->
                                <div class="modal-header d-flex justify-content-center">
                                    <h1>${global.data.restaurants[i].restaurantName}</h1>
                                </div>
                    
                                <!-- Body -->
                                <div class="modal-body d-flex justify-content-center">
                                    <img src=${global.data.restaurants[i].photo} alt="photo restaurant" class="modalImg">
                                </div>

                                <div class="costumerAdvice" id="costumerAdvice${i+1}"></div>
                                
                                <!-- Footer -->
                                <div class="modal-footer modal-footer--mine">
                                    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>`;


                    $("#allRestaurants").append(restaurantCardsTemplate);
                    $("#allRestaurants").append(modalTemplate);

                    /* add restaurants markers */
                    let positionLat = global.data.restaurants[i].lat;
                    let positionLng = global.data.restaurants[i].lng;

                    let coordsRestau = new google.maps.LatLng(positionLat, positionLng);

                    allMarkers.push(coordsRestau);

                    console.log('position restau :' + coordsRestau);
                    
                    global.methods.filterRatings(restaurantsJSON.displayAverage(global.data.restaurants[i]));

                    restaurantsJSON.getAdviceFromRestaurantsJSON(i+1, global.data.restaurants[i].ratings);
                }
            });
        }

    }
}

const init = (() => {
    global.methods.getGeolocationUserPermission();
    global.methods.displayRestaurantsCardsNearUserFromJSON();
})();
