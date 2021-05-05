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

        filterRatings(restaurants, ratingsAverage) {
            $(document).ready(function() {
                $("#slider-range").slider({
                    range: true,
                    min: 0,
                    max: 5,
                    values: [0, 5],
                    slide: function(event, ui) {
                        $("#amount").val(ui.values[0] + " - " + ui.values[1]);
                        new Promise(function(resolve, reject) {
                            if (ratingsAverage != null) {
                                resolve(ratingsAverage);
                            } else {
                                reject("Error");
                            }
                        }).then(
                            function(success) { 
                                global.methods.filterListing(restaurants, ui.values[0], ui.values[1]);
                            },
                            function(error) { 
                                /* code if some error */ 
                            }
                        )
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
                     
                });
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

        filterListing(restaurants, lowerValue, upperValue) {
            restaurants.filter((elRestau) => {

                const restaurantsJSON = new RestaurantsJSON(
                    elRestau.name, 
                    elRestau.photo, 
                    elRestau.address, 
                    elRestau.lat, 
                    elRestau.lng, 
                    elRestau.ratings, 
                    elRestau.comment
                );

                Number.prototype.between = function(lower, upper) {
                    return lower <= this && this <= upper;
                };

                if (restaurantsJSON.displayAverage(elRestau).between(lowerValue, upperValue)) {
                    filteredRestauResults.push(elRestau);
                    global.methods.updateListing(filteredRestauResults);
                }

            })

        },


        restauCardTemplate(restaurant, index) {

            const restaurantsJSON = new RestaurantsJSON(
                restaurant.name, 
                restaurant.photo, 
                restaurant.address, 
                restaurant.lat, 
                restaurant.lng, 
                restaurant.ratings, 
                restaurant.comment
            );

            /* template of restaurant cards at the right of map  */
            let restaurantCardsTemplate =  
            `<button type="button" data-toggle="modal" data-target="#restaurantDetails${index+1}">
                <div class="card mb-3 cardOfRestau" style="max-width: 540px;">
                    <div class="row g-0">
                        <div class="col-md-4">
                        <img src=${restaurant.photo} alt="photo restaurant" class="cardImg">
                        </div>
                        <div class="col-md-8">
                        <div class="card-body cardBody">
                            <h5 class="card-title">${restaurant.restaurantName}</h5>
                            <p class="card-text">${restaurant.address}</p>
                            <p class="card-text"><small class="text-muted">${restaurantsJSON.displayAverage(restaurant)}</small></p>
                        </div>
                        </div>
                    </div>
                </div>
            </button>`;

            let modalTemplate = 
            `<div id="restaurantDetails${index+1}" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
            
                        <!-- Header -->
                        <div class="modal-header d-flex justify-content-center">
                            <h1>${restaurant.restaurantName}</h1>
                        </div>
            
                        <!-- Body -->
                        <div class="modal-body d-flex justify-content-center">
                            <img src=${restaurant.photo} alt="photo restaurant" class="modalImg">
                        </div>

                        <div class="costumerAdvice" id="costumerAdvice${index+1}"></div>
                        
                        <!-- Footer -->
                        <div class="modal-footer modal-footer--mine">
                            <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>`;

            $("#allRestaurants").append(restaurantCardsTemplate);
            $("#allRestaurants").append(modalTemplate);
        },

        updateListing(restaurants) {

            restaurants.map((elRestau, index) => {
                
                global.methods.restauCardTemplate(elRestau, index);

                /* add restaurants markers */
                let positionLat = elRestau.lat;
                let positionLng = elRestau.lng;

                let coordsRestau = new google.maps.LatLng(positionLat, positionLng);

                allMarkers.push(coordsRestau);

                const restaurantsJSON = new RestaurantsJSON(
                    elRestau.name, 
                    elRestau.photo, 
                    elRestau.address, 
                    elRestau.lat, 
                    elRestau.lng, 
                    elRestau.ratings, 
                    elRestau.comment
                );
                
                global.methods.filterRatings(restaurants, restaurantsJSON.displayAverage(elRestau));
                restaurantsJSON.getAdviceFromRestaurantsJSON(index+1, elRestau.ratings);

            })
        },

        /* display the restaurants cards near the user */
        initDisplayRestaurants() {
            services.getData("./assets/json/restaurants.json")
            .then((data) => {
                global.data.restaurants = data;
                global.methods.updateListing(global.data.restaurants);         
            });
        }

    }
}

const init = (() => {
    global.methods.getGeolocationUserPermission();
    global.methods.initDisplayRestaurants();
})();
