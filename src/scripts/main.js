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

            let buttonCard = $('<button>');
            buttonCard.attr("id", "restauCard"+index);
            buttonCard.attr("class", "restauCard");
            buttonCard.attr("type", "button");
            buttonCard.attr("data-toggle", "modal");
            buttonCard.attr("data-target", "#restaurantDetails"+index);
            buttonCard.attr("data-backdrop", "static");
            buttonCard.attr("data-keyboard", "false");

            let cardBody = $('<div>');
            cardBody.attr("id", "cardOfRestau"+index);
            cardBody.attr("class", "card mb-3 cardOfRestau");
            cardBody.attr("style", "max-width: 540px");

            let cardDetails = $('<div>');
            cardDetails.attr("id", "cardDetails"+index);
            cardDetails.attr("class", "row g-0 cardDetails");

            let imgUrl = $('<img>');
            imgUrl.attr("id", "urlImg"+index);
            imgUrl.attr("class", "col-md-6 urlImg");
            imgUrl.attr("src", global.methods.getImgs(restaurant.lat, restaurant.lng));

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
            restauAverage.attr("id", "restauAverage"+index);

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

        generateModalCardTemplate(id, appendId, object, restaurant, index) {

            let ratings = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
            let option = '';

            let modalContainer = $('<div>');
            modalContainer.attr("id", id+index);
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

            let modalImg = $('<img>');
            modalImg.attr("id", "modalImg"+index);
            modalImg.attr("class", "col-md-12 modalImg"); 
            modalImg.attr("src", global.methods.getImgs(restaurant.lat, restaurant.lng));

            let modalAdvice = $('<div>');
            modalAdvice.attr("id", "costumerAdvice"+index);
            modalAdvice.attr("class", "costumerAdvice"); 

            let modalFormAdvice = $('<div>');
            modalFormAdvice.attr("id", "costumerAdviceForm"+index);
            modalFormAdvice.attr("class", "costumerAdviceForm"); 

            let modalFooter = $('<div>');
            modalFooter.attr("class", "modal-footer modal-footer--mine");

            let closeModalButton = $('<button>');
            closeModalButton.attr("id", "closeButton"+index);
            closeModalButton.attr("type", "button");
            closeModalButton.attr("class", "btn btn-default");
            closeModalButton.attr("data-dismiss", "modal");

            $("#"+appendId).append(modalContainer);

            let formAdvice = $('<form>');
            formAdvice.attr("id", "form"+index);

            let formAdviceTitle = $('<h3>');
            formAdviceTitle.attr("class", "col-md-12");

            let formSelectBody = $('<div>');
            formSelectBody.attr("class", "form-group col-md-12");

            let formSelectLabel= $('<label>');
            formSelectLabel.attr("for", "exampleFormControlSelect"+index);

            let selectRatings = $('<select>');
            selectRatings.attr("class", "form-control");
            selectRatings.attr("id", "ratingType"+index);

            let optionRating = $('<option>');

             let formAdviceBody = $('<div>');
            formAdviceBody.attr("class", "col-md-12");

            let formAdviceLabel = $('<label>');
            formAdviceLabel.attr("for", "formGroupExampleInput");

            let formAdviceTextarea = $('<textarea>');
            formAdviceTextarea.attr("type", "text");
            formAdviceTextarea.attr("class", "form-control");
            formAdviceTextarea.attr("id", "comment"+index);
            formAdviceTextarea.attr("placeholder", "");

            let postAdviceButton = $('<button>');
            postAdviceButton.attr("type", "button");
            postAdviceButton.attr("id", "postAdviceButton"+index)
            postAdviceButton.attr("class", "btn btn-success btn-lg btn-block");
            postAdviceButton.attr("style", "border-radius: 0; margin-top: 10px;"); 

            let errorContainer = $('<div>');
            errorContainer.attr("id", "errorContainer"+index);

            modalContainer.append(modalDialog);
            modalDialog.append(modalContent);
            modalContent.append(modalHeader);
            modalHeader.append(modalTitle);
            modalTitle.append(restaurant.restaurantName);
            modalContent.append(modalBody);
            modalBody.append(modalImg);
            modalContent.append(modalAdvice);
            modalContent.append(modalFormAdvice);
            
            modalFormAdvice.append(formAdvice);
            formAdvice.append(formAdviceTitle);
            formAdviceTitle.append("Publiez votre avis :");
            formAdvice.append(formSelectBody);
            formSelectBody.append(formSelectLabel);
            formSelectLabel.append("Ajoutez une note :");
            formSelectBody.append(selectRatings);
            selectRatings.append(optionRating);
            modalFormAdvice.append(errorContainer);

            for (let i = 0; i < ratings.length; i++){
                option += '<option value="'+ ratings[i] + '">' + ratings[i] + '</option>';
            }
            $('#ratingType' + index).append(option);

            formAdvice.append(formAdviceBody);
            formAdviceBody.append(formAdviceLabel);
            formAdviceLabel.append("Ajoutez votre commentaire :");
            formAdviceBody.append(formAdviceTextarea);
            formAdvice.append(postAdviceButton);
            postAdviceButton.append("Valider");

            modalAdvice.append(object.getAdviceFromRestaurantsJSON(index, restaurant.ratings));
            modalContent.append(modalFooter);
            modalFooter.append(closeModalButton);
            closeModalButton.append("Fermer");

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
})();

