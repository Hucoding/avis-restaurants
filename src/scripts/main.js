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

        //Filtrage des restaurants par leur moyenne de notes
        filterRatings(restaurants, ratingsAverage) {
            $(document).ready(function() {
                let rating1;
                let rating2;
                $("#slider-range").slider({
                    range: true,
                    orientation: "horizontal",
                    min: 0,
                    max: 5,
                    step: 1,
                    values: [0, 5],
                    slide: function(event, ui) {
                       rating1 =  ui.values[0];
                       rating2 =  ui.values[1];

                       global.methods.filterListing(global.data.restaurants, rating1, rating2);

                       $("#ratings").val("Moyennes : " + rating1 + " - " + rating2);
                    },
                });
                $("#ratings").val( "Moyennes : " + $("#slider-range").slider("values", 0) + " - " + $("#slider-range").slider("values", 1));
            });
        },

        //récupération de la validation de la géolocalisation par l'utilisateur
        getGeolocationUserPermission() {
            let locationIsActived;
            navigator.geolocation.getCurrentPosition( function(position) {
                let positionLat = position.coords.latitude;
                let positionLng = position.coords.longitude;

                let coordsUser = new google.maps.LatLng(positionLat, positionLng);

                locationIsActived = true;

                const mapGoogle = new MyMap(positionLat, positionLng, locationIsActived);
                mapGoogle.initMap(positionLat, positionLng, locationIsActived);
                global.data.map = mapGoogle;

                mapGoogle.addMarker(coordsUser, true);

                //affichage des cards des restaurants
                global.methods.initDisplayRestaurants();

            }, error => {
                //localisation refusée par l'utilisateur => localisation par défaut sur Paris
                let positionLat = 48.856614;
                let positionLng = 2.3522219;
                
                let defaultUserCoords = new google.maps.LatLng(positionLat, positionLng);

                locationIsActived = false;
        
                const mapGoogle = new MyMap(positionLat, positionLng, locationIsActived);
                mapGoogle.initMap(positionLat, positionLng, locationIsActived);
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
        getImgs(lat, lng) {
            let url;
            if (url != null || url != "") {
                url = "https://maps.googleapis.com/maps/api/streetview?size=500x400&location=" + encodeURIComponent(lat + ", " + lng) + "&key=" + apiKey;
            } else {
                url = "https://www.unfe.org/wp-content/uploads/2019/04/SM-placeholder.png";
            }
            return url;
        },

        //affichage des images récupérer via GOOGLE STREETVIEW dans leur card respective
        displayImgs(object, element, index) {
            let restauIndex = index+1;

            global.methods.generateCardTemplate(object, element, restauIndex);
            global.methods.generateModalCardTemplate("restaurantDetails", "allRestaurants", object, element, restauIndex);
        },

        // génération d'une card d'un restaurant dans #allRestaurants
        generateCardTemplate(object, restaurant, index) {

            let card = `<button id="restauCard${index}" class="restauCard" type="button" data-toggle="modal" data-target="#restaurantDetails${index}" data-backdrop="static" data-keyboard="false">
            <div id="cardOfRestau${index}" class="card mb-3 cardOfRestau" style="max-width: 540px">
                <div id="cardDetails${index}" class="row g-0 cardDetails">
                    <img id="urlImg${index}" class="col-md-6 urlImg" src=${global.methods.getImgs(restaurant.lat, restaurant.lng)}>
                    <div class="col-md-6">
                        <div class="card-body cardBody"></div>
                            <p class="card-title">${restaurant.restaurantName}</p>
                            <p class="card-text">${restaurant.address}</p>
                            <small class="text-muted" id="restauAverage${index}"></small>
                        </div>
                    </div>
                </div>
            </button>`; 

            $("#allRestaurants").append(card);
            $("#restauAverage"+index).append(object.displayAverage(restaurant));

        },

        generateModalCardTemplate(id, appendId, object, restaurant, index) {

           let modal = `<div id="${id+index}" class="modal fade">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header d-flex justify-content-center">
                            <h1>${restaurant.restaurantName}</h1>
                        </div>
                        <div class="modal-body d-flex justify-content-center">
                            <img id="modalImg${index}" class="col-md-12 modalImg" src=${global.methods.getImgs(restaurant.lat, restaurant.lng)}>
                        </div>
                        <div id="costumerAdvice${index}" class="costumerAdvice"></div>
                        <div id="costumerAdviceForm${index}" class="costumerAdviceForm">
                            <form id="form${index}">
                                <h3 class="col-md-12">Publiez votre avis :</h3>
                                <div class="form-group col-md-12">
                                    <label for="exampleFormControlSelect${index}">Ajoutez une note :</label>
                                    <select class="form-control" id="ratingType${index}">
                                        <option></option>
                                        <option value="1">1</option>
                                        <option value="1.5">1.5</option>
                                        <option value="2">2</option>
                                        <option value="2.5">2.5</option>
                                        <option value="3">3</option>
                                        <option value="3.5">3.5</option>
                                        <option value="4">4</option>
                                        <option value="4.5">4.5</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                                <div class="col-md-12">
                                    <label for="formGroupExampleInput">Ajoutez votre commentaire :</label>
                                    <textarea type="text" class="form-control" id="comment${index}" placeholder=""></textarea>
                                </div>
                                <button type="button" id="postAdviceButton${index}" class="btn btn-success btn-lg btn-block" style="border-radius: 0; margin-top: 10px;">Valider</button>
                            </form>
                            <div id="errorContainer${index}"></div>
                        </div>
                        <div class="modal-footer modal-footer--mine">
                            <button id="closeButton${index}" type="button" class="btn btn-default" data-dismiss="modal">Fermer</button>
                        </div>
                    </div>
                </div>
            </div>`;

            $("#"+appendId).append(modal);

            $("#costumerAdvice" + index).append(
                object.getAdviceFromRestaurantsJSON(index, restaurant.ratings)
            );

            $("#closeButton"+index).click(() => {
                $("#comment"+index).val('');
                $("#ratingType"+index).val('');
            });

            $("#postAdviceButton"+index).click(() => {
                let newAdvice = true;
                let rating = $("#ratingType"+index).val();
                let comment = $("#comment"+index).val();
                
                global.methods.verifyNumberCharactersAdvice(object, restaurant, index, rating, comment, newAdvice);
            });
        },

        verifyNumberCharactersAdvice(object, restaurant, index, field1, field2, checkValue) {
            if (field2.length < 3 || field1.length < 1) {
                checkValue = false;
                global.methods.saveComment(object, restaurant, index, checkValue, field1, field2);
            } else {
                checkValue = true;
                global.methods.saveComment(object, restaurant, index, checkValue, field1, field2);
            }
        },

        saveComment(object, restaurant, index, checkValue, rating, comment) {
            if (checkValue == true) {
                $("#errorContainer"+index).html("");
                $("#restauAverage"+index).html("");
                $("#comment"+index).val('');
                $("#ratingType"+index).val('');
                
                const advice = new Advice(
                    Number(rating),
                    comment
                ); 

                restaurant.ratings.push(advice);

                $("#costumerAdvice"+index).append(object.getAdviceFromRestaurantsJSON(index, restaurant.ratings));
                $("#restauAverage"+index).append(object.displayAverage(restaurant));
               
            } else {
                $("#errorContainer"+index).html("");
                let typeValueIsComment = false;
                global.methods.templateErrorMessage(index, true, typeValueIsComment);
            }
        },

        templateErrorMessage(index, activeValue, typeValue) {
            let error = $('<div>');
    
            error.attr("id", "errorMessage"+index);
            error.attr("class", "alert alert-danger");
            error.attr("role", "alert");

            let message;

            if(typeValue == true) {
                message = `<p>Attention : Le nom de l'établissement doit contenir au moins 3 caractères au minimum !</p>`;
            } else {
                message = `<p>Attention : Votre commentaire doit contenir au moins 3 caractères au minimum !</p>`;
                if($("#ratingType"+index).val() == 0) {
                    message = '';
                    message = `<p>Attention : Vous devez ajoutez une note entre 1 et 5 !</p>`;
                }
            }
        
            if(activeValue == true ){
                $("#errorContainer"+index).html("");
                $("#errorContainer"+index).append(error);
                $(error).append(message);
            }
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

                let restauIndex = index+1;

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
                const marker = global.data.map.addMarker(coordsRestau, false);

                marker.addListener("click", () => {
                    $(`#restaurantDetails${restauIndex}`).modal('show'); 
                });
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
})(); // fonction auto appelée