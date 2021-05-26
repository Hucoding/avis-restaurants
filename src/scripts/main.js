let global = {
    data: {
        title : "Avis restaurant",
        filteredRestauResults: [],
        newMarkers: []
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
                                global.methods.filterListing(global.data.restaurants, ui.values[0], ui.values[1]);
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

        getGeolocationUserPermission() {
            navigator.geolocation.getCurrentPosition( function(position) {
                let positionLat = position.coords.latitude;
                let positionLng = position.coords.longitude;

                let coordsUser = new google.maps.LatLng(positionLat, positionLng);

                userMarker.push(coordsUser);

                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);
            }, error => {
                let positionLat = 48.856614;
                let positionLng = 2.3522219;
                
                // if the user decline the location display the default marker in Paris 
                let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);

                userMarker.push(defaultUserCoords);
        
                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);
            });
        },

        filterListing(restaurants, lowerValue, upperValue) {
            global.data.filteredRestauResults = [];

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

                console.log("NOTE FILTRE => " + restaurantsJSON.displayAverage(elRestau));

                if (restaurantsJSON.displayAverage(elRestau).between(lowerValue, upperValue)) {
                    console.log('lowerValue =>' + lowerValue);
                    console.log('upperValue =>' + upperValue);
                    //problème avec le slide à régler mais sinon le filtre fonctionne parfaitement

                    global.data.filteredRestauResults.push(elRestau);

                    console.log("table filtered Restau Results : " + JSON.stringify(global.data.filteredRestauResults));
                }
                global.methods.updateListing(global.data.filteredRestauResults);
                global.methods.updateMarkers(global.data.filteredRestauResults);

                console.log("global.data.filteredRestauResults LENGTH : " +  global.data.filteredRestauResults.length);

            })

        },

        getUrlImg(element, index) {

            //images dans un tableau de promises 
            //si il y'a pas d'image streetview 
            //on charge une image Json
            //sinon on charge placeholder

            console.log("element.photo =>" + element.photo);

            let restauIndex = index+1;

            let markerCoords = new google.maps.LatLng(
                element.lat, 
                element.lng
            );

            var panorama = new google.maps.StreetViewPanorama(document.getElementById('#restaurantDetails'+restauIndex), {
                position: markerCoords, 
                pov: {
                    heading: 34,
                    pitch: 10,
                    zoom: 1
                }
            });


            const imgs = new Promise((resolve, reject) => {
                setTimeout(() => {
                    console.log('The first promise has resolved');
                    let latlng = panorama.getPosition();
                    let pov = panorama.getPov();
                    let url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + encodeURIComponent(latlng.lat() + ", " + latlng.lng()) + "&fov=" + (180 / Math.pow(2, pov.zoom)) +  "&heading=" + encodeURI(pov.heading) + "&pitch=" + encodeURI(pov.pitch) + "&key=AIzaSyC-ZtycdNkeRoLzI4qk6PF4NjyeOofDjS4";
                    console.log("lat: " + latlng.lat() + "     " + "lng: " + latlng.lng());
                    console.log("img src: " + url);
                    resolve(url);
                }, index * 1000);
            });
            

            Promise.all([imgs]).then((values) => {
                
                /* if (values == null || values == "") {
                    console.log("VALUES NULL " + values); // si c'est null charge la photo du JSON
                    values = element.photo;
                    return values;
                } else if (element.photo == null || element.photo == "") {
                    console.log("element photo is null");
                    element.photo = values;
                    return element.photo;
                } else {
                    //sinon placeholder
                    console.log("call values OK");
                }*/


                $(document).ready(function() {   //same as: $(function() { 

                    var myImage = $('<img/>');

                    myImage.attr('width', 300);
                    myImage.attr('height', 300);
                    myImage.attr('class', "groupMediaPhoto");
                    myImage.attr('src', values);


                    console.log(myImage);
                });

                //this.restauCardTemplate(element, index, values)

                //return values;

            });

        },

        restauCardTemplate(restaurant, index, urlImg) {

            console.log("urlImg => " + urlImg);

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
                        <img src=${urlImg} alt="photo restaurant" class="cardImg">
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
                            <img src=${restaurant.photo} alt="photo restaurant" class="modalImg" id="modalImg${index+1}">
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



        updateMarkers(restaurant) {

            if(global.data.newMarkers.length > 0) {
                const mapGoogle = new MyMap(restaurant.lat, restaurant.lng);
                mapGoogle.deleteMarkers(global.data.newMarkers);
            }

            restaurant.map((elRestau, index) => {
                let positionLat = elRestau.lat;
                let positionLng = elRestau.lng;

                let newCoords = new google.maps.LatLng(positionLat, positionLng);

                global.data.newMarkers.push(newCoords);

                let coordsFromArray = JSON.stringify(newCoords);
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

                let restauIndex = index+1;
                
                markers.addListener("click", () => {
                    $('#restaurantDetails'+restauIndex).modal('show'); 
                });

                console.log('NEW MARKERS => ' + global.data.newMarkers);
            })

            if(allMarkers.length > 0) {
                const mapGoogle = new MyMap(restaurant.lat, restaurant.lng);
                mapGoogle.deleteMarkers(allMarkers);
            }

        },

        updateListing(restaurants) {

            $('#allRestaurants').html('');

            restaurants.map((elRestau, index) => {

                const restaurantsJSON = new RestaurantsJSON(
                    elRestau.name, 
                    elRestau.photo, 
                    elRestau.address, 
                    elRestau.lat, 
                    elRestau.lng, 
                    elRestau.ratings, 
                    elRestau.comment
                );
                
                global.methods.restauCardTemplate(elRestau, index, this.getUrlImg(elRestau, index));
                //global.methods.getUrlImg(elRestau, index)

                /* add restaurants markers */
                let positionLat = elRestau.lat;
                let positionLng = elRestau.lng;

                let coordsRestau = new google.maps.LatLng(positionLat, positionLng);

                allMarkers.push(coordsRestau);
                
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
