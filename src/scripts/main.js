let global = {
    data: {
        title : "Avis restaurant",
        filteredRestauResults: [],
        newMarkers: [],
        map: null,
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

        //méthode pour filtrer les restaurant avec le range
        filterRatings(restaurants, ratingsAverage) {
            $(document).ready(function() {
                $("#slider-range").slider({
                    range: true,
                    min: 0,
                    max: 5,
                    step: 0.5,
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

        //méthode lié a la géolocalisation si l'utilisateur accepte ou non la géoloc
        /*getGeolocationUserPermission() {
            navigator.geolocation.getCurrentPosition( function(position) {
                let positionLat = position.coords.latitude;
                let positionLng = position.coords.longitude;

                let coordsUser = new google.maps.LatLng(positionLat, positionLng);

                userMarker.push(coordsUser);

                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);

                //affichage des cards des restaurants
                global.methods.initDisplayRestaurants();
            }, error => {
                let positionLat = 48.856614;
                let positionLng = 2.3522219;
                
                // if the user decline the location display the default marker in Paris 
                let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);

                userMarker.push(defaultUserCoords);
        
                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);

                //affichage des cards des restaurants
                global.methods.initDisplayRestaurants();
            });
        },*/

        getGeolocationUserPermission() {
            navigator.geolocation.getCurrentPosition( function(position) {
                let positionLat = position.coords.latitude;
                let positionLng = position.coords.longitude;

                let coordsUser = new google.maps.LatLng(positionLat, positionLng);

                // userMarker.push(coordsUser);

                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);
                global.data.map = mapGoogle;

                mapGoogle.addMarker(coordsUser, true);

                //affichage des cards des restaurants
                global.methods.initDisplayRestaurants();
            }, error => {
                let positionLat = 48.856614;
                let positionLng = 2.3522219;
                
                // if the user decline the location display the default marker in Paris 
                let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);

                // userMarker.push(defaultUserCoords);
        
                const mapGoogle = new MyMap(positionLat, positionLng);
                mapGoogle.initMap(positionLat, positionLng);
                global.data.map = mapGoogle;

                mapGoogle.addMarker(defaultUserCoords, true);

                //affichage des cards des restaurants
                global.methods.initDisplayRestaurants();
            });
        },

        //résultat de la liste filtré
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

                //console.log("NOTE FILTRE => " + restaurantsJSON.displayAverage(elRestau));

                if (restaurantsJSON.displayAverage(elRestau).between(lowerValue, upperValue)) {
                    //console.log('lowerValue =>' + lowerValue);
                    //console.log('upperValue =>' + upperValue);
                    //problème avec le slide à régler mais sinon le filtre fonctionne parfaitement

                    global.data.filteredRestauResults.push(elRestau);

                    //console.log("table filtered Restau Results : " + JSON.stringify(global.data.filteredRestauResults));
                }
                global.methods.updateListing(global.data.filteredRestauResults);
                global.methods.updateMarkers(global.data.filteredRestauResults);

                //console.log("global.data.filteredRestauResults LENGTH : " +  global.data.filteredRestauResults.length);

            })

        },

        //images dans un tableau de promises 
        //si il y'a pas d'image streetview 
        //on charge une image Json
        //sinon on charge placeholder


        //récupération de la photo du restau via streetview
        getUrlImg(element, index) {

            let restauIndex = index+1;

            let markerCoords = new google.maps.LatLng(
                element.lat, 
                element.lng
            );
            
            console.log(element.name);

            global.methods.generateCardTemplate(element, restauIndex);
            global.methods.generateModalCardTemplate(element, restauIndex);


            var panorama = new google.maps.StreetViewPanorama(document.getElementById('urlImg'+restauIndex), {
                position: markerCoords, 
                pov: {
                    heading: 34,
                    pitch: 10,
                    zoom: 1
                }, 
                fullscreenControl: false, 
                disableDefaultUI: true,
                linksControl: false,
                panControl: false,
                enableCloseButton: false,
                scrollwheel: false,
                zoomControl: false,
                addressControl: false,
                overviewMapControl: false,
                motionTracking: false,
                motionTrackingControl: false,
                clickToGo: false
            });

            const imgs = new Promise((resolve, reject) => {
                
                //console.log('The first promise has resolved');
                let latlng = panorama.getPosition();
                let pov = panorama.getPov();
                let url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + encodeURIComponent(latlng.lat() + ", " + latlng.lng()) + "&fov=" + (180 / Math.pow(2, pov.zoom)) +  "&heading=" + encodeURI(pov.heading) + "&pitch=" + encodeURI(pov.pitch) + "&key=" + apiKey;
                resolve(url);
            
            });


            Promise.all([imgs]).then((values) => {
                
                if (values == null || values == "") {
                    values = element.photo;
                    return values;
                } else if (element.photo == null || element.photo == "") {
                    element.photo = values;
                    return element.photo;
                } else {
                   $("#urlImg"+restauIndex).append(values);
                   $("#modalImg"+restauIndex).append(values);
                }

            });

        },

        generateCardTemplate(restaurant, index) {

            //on génère une card à partir du moment ou on tente de générer une image streetview
            //on passe l'index de la méthode => getUrlImg
            //ici on insère le code permetant de générer une card

            let buttonCard = $('<button>');
            buttonCard.attr("id", "restauCard"+index);
            buttonCard.attr("class", "restauCard");
            buttonCard.attr("type", "button");
            buttonCard.attr("data-toggle", "modal");
            buttonCard.attr("data-target", "#restaurantDetails"+index);
        
            let cardBody = $('<div>');
            cardBody.attr("id", "cardOfRestau"+index);
            cardBody.attr("class", "card mb-3 cardOfRestau");
            cardBody.attr("style", "max-width: 540px");

            let cardDetails = $('<div>');
            cardDetails.attr("id", "cardDetails"+index);
            cardDetails.attr("class", "row g-0 cardDetails");

            let imgUrl = $('<div>');
            imgUrl.attr("id", "urlImg"+index);
            imgUrl.attr("class", "col-md-6");

            let restauBodyInfo = $('<div>');
            restauBodyInfo.attr("class", "col-md-6");

            let restauBodyDetails = $('<div>');
            restauBodyDetails.attr("class", "card-body cardBody");

            let restauName = $('<p>');
            restauName.attr("class", "card-title");
            restauName.append("Nom");

            let restauAddress = $('<p>');
            restauAddress.attr("class", "card-text");
            restauAddress.append(restaurant.address);

            let restauAverageBody = $('<p>');
            restauAverageBody.attr("class", "card-text");

            let restauAverage =  $('<small>');
            restauAverage.attr("class", "text-muted");

            $("#allRestaurants").append(buttonCard);

            buttonCard.append(cardBody);
            cardBody.append(cardDetails);
            cardDetails.append(imgUrl);
            cardDetails.append(restauBodyInfo);
            restauBodyInfo.append(restauBodyDetails);
            restauBodyInfo.append(restauName);
            restauBodyInfo.append(restauAddress);
        },

        generateModalCardTemplate(restaurant, index) {
            console.log("modal is here");
            //si generateCardTemplate est générer alors on peut générer une modal pour une card

            let modalContainer = $('<div>');
            modalContainer.attr("id", "restaurantDetails"+index);
            modalContainer.attr("class", "modal fade");

            let modalDialog = $('<div>');
            modalDialog.attr("class", "modal-dialog modal-lg");

            let modalContent = $('<div>');
            modalContent.attr("class", "modal-content"); 

            let modalHeader = $('<div>');
            modalHeader.attr("class", "modal-header d-flex justify-content-center"); 

            let modalTitle = $('<h1>');

            let modalBody = $('<div>');
            modalBody.attr("class", "modal-body d-flex justify-content-center"); 

            let modalImg = $('<div>');
            modalImg.attr("id", "modalImg"+index);
            modalImg.attr("class", "modalImg"); 

            let modalAdvice = $('<div>');
           // modalAdvice.attr("id", "modalImg"+index);
           // modalAdvice.attr("class", "modalImg"); 

            let modalFooter = $('<div>');
            modalFooter.attr("class", "modal-footer modal-footer--mine");

            let closeModalButton = $('<button>');
            closeModalButton.attr("type", "button");
            closeModalButton.attr("class", "btn btn-default");
            closeModalButton.attr("data-dismiss", "modal");

            $("#allRestaurants").append(modalContainer);

            modalContainer.append(modalDialog);
            modalDialog.append(modalContent);
            modalContent.append(modalHeader);
            modalHeader.append(modalTitle);
            modalTitle.append("Nom");
            modalContent.append(modalBody);
            modalBody.append(modalImg);
            modalContent.append(modalAdvice);
            modalContent.append(modalFooter);
            modalFooter.append(closeModalButton);

        },

        /*restauCardTemplate(restaurant, index) {


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
            // <img src=${urlImg} alt="photo restaurant" class="cardImg">


            /*let modalTemplate = 
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

            
            $("#allRestaurants").append(modalTemplate);
        },*/


        updateMarkers(restaurants) {

            /*if(global.data.newMarkers.length > 0) {
                const mapGoogle = new MyMap(restaurant.lat, restaurant.lng);
                mapGoogle.deleteMarkers(global.data.newMarkers);
            }*/

            if(global.data.map.markers.length > 0) {
                global.data.map.clearMarkers();
            }

            restaurants.map((elRestau, index) => {
                const positionLat = elRestau.lat;
                const positionLng = elRestau.lng;

                const newCoords = new google.maps.LatLng(positionLat, positionLng);

                //global.data.newMarkers.push(newCoords);

                //let coordsFromArray = JSON.stringify(newCoords);
                //let parsedCoordsPosition = JSON.parse(coordsFromArray);

                //console.log("latitude MARQUEUR " + parsedCoordsPosition.lat);
                //console.log("longitude MARQUEUR " + parsedCoordsPosition.lng);

                /*let markerCoords = new google.maps.LatLng(
                    parsedCoordsPosition.lat, 
                    parsedCoordsPosition.lng
                );

                let markers = new google.maps.Marker({
                    map: map, 
                    position: markerCoords
                });*/

                const marker = global.data.map.addMarker(newCoords, false);

                let restauIndex = index+1;
                
                /*markers.addListener("click", () => {
                    $('#restaurantDetails'+restauIndex).modal('show'); 
                });*/

                marker.addListener("click", () => {
                    $(`#restaurantDetails${restauIndex}`).modal('show'); 
                });

                //console.log('NEW MARKERS => ' + global.data.newMarkers);
            })

            /* if(allMarkers.length > 0) {
                const mapGoogle = new MyMap(restaurant.lat, restaurant.lng);
                mapGoogle.deleteMarkers(allMarkers);
            } */

        },

        updateListing(restaurants) {

            $('#allRestaurants').html('');

            const self = this;

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
                
                //global.methods.restauCardTemplate(elRestau, index);

                global.methods.getUrlImg(elRestau, index);

                /* add restaurants markers */
                let positionLat = elRestau.lat;
                let positionLng = elRestau.lng;

                let coordsRestau = new google.maps.LatLng(positionLat, positionLng);

                //allMarkers.push(coordsRestau);
                global.data.map.addMarker(coordsRestau, false);
                
                global.methods.filterRatings(restaurants, restaurantsJSON.displayAverage(elRestau));
                restaurantsJSON.getAdviceFromRestaurantsJSON(index+1, elRestau.ratings);
            })
        },

        /* display the restaurants cards near the user */
        initDisplayRestaurants() {
            services.getData("./assets/json/restaurants.json")
            /* .then((data) => {
                global.data.restaurants = data;
                global.methods.updateListing(global.data.restaurants);         
            }); */
            .then((data) => {
                global.data.restaurants = data;
                global.methods.updateListing(global.data.restaurants);         
            });
        }

    }
}

const init = (() => {
    global.methods.getGeolocationUserPermission();
})();




//global.methods.generateRestauImg(element, values, restauIndex);
//return values;
/*generateRestauImg(restaurant, photo, index) {
    let restaurantCardsTemplate =  
    `<button id="restauCard${index+1}"" type="button" data-toggle="modal" data-target="#restaurantDetails${index+1}">
        <div class="card mb-3 cardOfRestau" style="max-width: 540px;">
            <div class="row g-0">
                <div id="urlImg${index+1}" class="col-md-4">
                </div>
                <div class="col-md-8">
                <div class="card-body cardBody">
                    <h5 class="card-title">${restaurant.restaurantName}</h5>
                    <p class="card-text">${restaurant.address}</p>
                    <p class="card-text"><small class="text-muted"></small></p>
                </div>
                </div>
            </div>
        </div>
    </button>`;

    //${restaurantsJSON.displayAverage(restaurant)}



    //$("#allRestaurants").append();
},*/
