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

        //insertion d'une balise script pour initialiser la map de GOOGLE
        loadScript() {
            let mapScript = document.createElement('script');
            mapScript.type = 'text/javascript';
            mapScript.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "";
            document.body.append(mapScript);   
        },                      

        //Filtrage des restaurants par leur moyenne de notes
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

        //récupération de la validation de la géolocalisation par l'utilisateur
        getGeolocationUserPermission() {
            navigator.geolocation.getCurrentPosition( function(position) {
                let positionLat = position.coords.latitude;
                let positionLng = position.coords.longitude;

                let coordsUser = new google.maps.LatLng(positionLat, positionLng);

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

                if (restaurantsJSON.displayAverage(elRestau).between(lowerValue, upperValue)) {
                    global.data.filteredRestauResults.push(elRestau);
                }
                global.methods.updateListing(global.data.filteredRestauResults);
                global.methods.updateMarkers(global.data.filteredRestauResults);

            })

        },

       //récupération des photos des restaurant via GOOGLE STREETVIEW
        getImgs(restaurant, coords, id, index) {
            var panorama = new google.maps.StreetViewPanorama(
                document.getElementById(id+index), {
                position: coords, 
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
                
                let latlng = panorama.getPosition();
                let pov = panorama.getPov();
                let url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + latlng.lat() + ", " + latlng.lng() + "&fov=" + (180 / Math.pow(2, pov.zoom)) +  "&heading=" + pov.heading + "&pitch=" + pov.pitch + "&key=" + apiKey;
                resolve(url);
            
            });

            Promise.all([imgs]).then((values) => {
                
                if (values == null || values == "") {
                    values = restaurant.photo;
                    return values;
                } else if (restaurant.photo == null || restaurant.photo == "") {
                    restaurant.photo = values;
                    return restaurant.photo;
                } else {
                   $(id+index).append(values);
                }

            });

        },

        //affichage des images récupérer via GOOGLE STREETVIEW dans leur card respective
        displayImgs(object, element, index) {
            let restauIndex = index+1;

            let markerCoords = new google.maps.LatLng(
                element.lat, 
                element.lng
            );
            
            global.methods.generateCardTemplate(object, element, restauIndex);
            global.methods.generateModalCardTemplate(object, element, restauIndex);
            
            global.methods.getImgs(element, markerCoords, "urlImg", restauIndex);
            global.methods.getImgs(element, markerCoords, "modalImg", restauIndex);

        },

        // génération d'une card d'un restaurant dans #allRestaurants
        generateCardTemplate(object, restaurant, index) {

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
            imgUrl.attr("class", "col-md-6 urlImg");

            let restauBodyInfo = $('<div>');
            restauBodyInfo.attr("class", "col-md-6");

            let restauBodyDetails = $('<div>');
            restauBodyDetails.attr("class", "card-body cardBody");

            let restauName = $('<p>');
            restauName.attr("class", "card-title");
            restauName.append(restaurant.restaurantName);

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
            restauBodyInfo.append(restauAverage);
            restauAverage.append(object.displayAverage(restaurant));

        },

        // génération d'un modal pour une card d'un restaurant
        generateModalCardTemplate(object, restaurant, index) {

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
            modalImg.attr("class", "col-md-12 modalImg"); 

            let modalAdvice = $('<div>');
            modalAdvice.attr("id", "costumerAdvice"+index);
            modalAdvice.attr("class", "costumerAdvice"); 

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
            modalTitle.append(restaurant.restaurantName);
            modalContent.append(modalBody);
            modalBody.append(modalImg);
            modalContent.append(modalAdvice);
            modalAdvice.append(object.getAdviceFromRestaurantsJSON(index, restaurant.ratings));
            modalContent.append(modalFooter);
            modalFooter.append(closeModalButton);
            closeModalButton.append("Fermer");

        },

        //mise à jours des markers en fonction du filtre choisis par l'utilisateur
        updateMarkers(restaurants) {

            if(global.data.map.markers.length > 0) {
                global.data.map.clearMarkers();
            }

            restaurants.map((elRestau, index) => {
                const positionLat = elRestau.lat;
                const positionLng = elRestau.lng;

                const newCoords = new google.maps.LatLng(positionLat, positionLng);

                const marker = global.data.map.addMarker(newCoords, false);

                let restauIndex = index+1;

                marker.addListener("click", () => {
                    $(`#restaurantDetails${restauIndex}`).modal('show'); 
                });

            })

        },

        //mise à jours du listing des restaurants au niveau de #allRestaurants en fonction du filtre choisis par l'utilisateur
        updateListing(restaurants) {

            $('#allRestaurants').html('');

            restaurants.map((elRestau, index) => {

                const restaurantsJSON = new RestaurantsJSON(
                    elRestau.restaurantName, 
                    elRestau.photo, 
                    elRestau.address, 
                    elRestau.lat, 
                    elRestau.lng, 
                    elRestau.ratings, 
                    elRestau.comment
                );
                
                global.methods.displayImgs(restaurantsJSON, elRestau, index);

                let positionLat = elRestau.lat;
                let positionLng = elRestau.lng;

                let coordsRestau = new google.maps.LatLng(positionLat, positionLng);

                global.data.map.addMarker(coordsRestau, false);
                global.methods.filterRatings(restaurants, restaurantsJSON.displayAverage(elRestau));
            })
        },

        //initialisation globale des données json des restaurants de base
        initDisplayRestaurants() {
            services.getData("./assets/json/restaurants.json")
            .then((data) => {
                global.data.restaurants = data;
                global.methods.updateListing(global.data.restaurants);         
            });
        }

    }
}

//initialisation globale du projet
const init = (() => {
    global.methods.getGeolocationUserPermission();
})();

