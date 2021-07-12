class MyMap {
    constructor(latMap, lngMap, locationIsActived){
        this.map = null;
        this.latMap = latMap; 
        this.lngMap = lngMap; 
        this.locationIsActived = locationIsActived;
        this.markers = [];
        this.newRestaurantsByUser = [];
        this.newDatas = [];
        this.placesDatas = [];
        this.place = null;
    }

    initMap(latMap, lngMap, locationIsActived) {
        if(latMap != undefined && lngMap != undefined) {

            if (locationIsActived == true) {
                this.getMapWithUserParams(latMap, lngMap);
            } else {
                this.getMapWithUserParams(latMap, lngMap);
            }

            //récupérer photo d'une position clickée
            this.map.addListener("click", (mapsMouseEvent) => {
                let index;
                this.addRestaurant(index, mapsMouseEvent.latLng);
                this.getAddress(mapsMouseEvent.latLng);
            });

        } 
    }

    //récupération des paramètres de l'utilisateur pour lui afficher les restaurants aux alentours
    getMapWithUserParams(latMap, lngMap) {
        let service;
        let initCoords = new google.maps.LatLng(latMap, lngMap);
        let initZoom = 15;
       
        this.map = new google.maps.Map(document.getElementById("map"), {
            zoom: initZoom,
            center: initCoords,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        let map = this.map;

        let request = {
            location: initCoords,
            radius: '1500',
            type: ['restaurant']
        };
    
        service = new google.maps.places.PlacesService(map);
        return this.restaurantsSearch(request, service);
    }

    // recherche et ajout de nouveau restaurants via google places
    restaurantsSearch(request, service) {
        service.nearbySearch(
            request,
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < results.length; i++) {
                        // création de l'objet du nouveau restaurant
                        this.place = this.createObject(
                            results[i].name, 
                            "", 
                            results[i].vicinity, 
                            Number(results[i].geometry.location.lat().toFixed(7)), 
                            Number(results[i].geometry.location.lng().toFixed(7)), 
                            [], 
                            "", 
                        );

                        let positionLat = results[i].geometry.location.lat();
                        let positionLng = results[i].geometry.location.lng();
        
                        let coordsRestau = new google.maps.LatLng(positionLat, positionLng);
                        
                        //ajout du marqueur du nouveau restaurant
                        global.data.map.addMarker(coordsRestau, false);
                    }
                    this.addRestaurantFromPlaces(this.place);
                }
            }
        );
    }

    //fonction de création d'un nouvel objet (Place)
    createObject(name, photo, address, lat, lng, ratings, comment) {
        const restaurantsJSON = new RestaurantsJSON(
            name, 
            photo, 
            address, 
            lat, 
            lng, 
            ratings, 
            comment, 
        );

        delete restaurantsJSON.comment;
        delete restaurantsJSON.stars;

        this.placesDatas.push(restaurantsJSON);
        global.data.restaurants.push(restaurantsJSON);

        return restaurantsJSON;
    }

    //affectation des cards dans #allRestaurants avec la fonctionnalité de click sur les nouveaux markers
    addRestaurantFromPlaces(object) {
        $("#allRestaurants").html("");
        global.data.restaurants.map((elRestau, index) => {
            global.methods.displayImgs(object, elRestau, index);
            global.methods.updateMarkers(this.placesDatas);
        });
    }

    // récupérer l'adresse du restau par le click
    getAddress(latLng) {
        let geocoder = new google.maps.Geocoder();
        geocoder.geocode({'latLng': latLng},
        function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                (results[0]) ? document.getElementById("adressField1").value = results[0].formatted_address : document.getElementById("adressField1").value = "Aucuns résultats"
            } else {
                document.getElementById("adressField1").value = status;
            }
        }); 
    }

    // création d'une modal pour un nouveau restaurant
    generateModalTemplateForNewRestaurant(coords, index, urlImg) {

        let modalContainer = $('<div>');
        modalContainer.attr("id", "newRestaurant"+index);
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

        let modalNewRestauImg = $('<img>');
        modalNewRestauImg.attr("id", "modalNewRestauImg"+index);
        modalNewRestauImg.attr("class", "col-md-12 modalNewRestauImg"); 
        modalNewRestauImg.attr("src", urlImg);

        let modalAdvice = $('<div>');
        modalAdvice.attr("id", "costumerAdviceNewRestau"+index);
        modalAdvice.attr("class", "costumerAdviceNewRestau"); 

        let modalFooter = $('<div>');
        modalFooter.attr("class", "modal-footer modal-footer--mine");

        let closeModalButton = $('<button>');
        closeModalButton.attr("id", "saveRestau"+index);
        closeModalButton.attr("type", "button");
        closeModalButton.attr("class", "btn btn-default");
        closeModalButton.attr("data-dismiss", "modal");
        closeModalButton.attr("disabled", true);

        let formNewRestaurant = $('<form>');
        formNewRestaurant.attr("id", "from"+index);

        let addName = $('<div>');
        addName.attr("class", "form-group col-md-12");

        let addNameLabel = $('<label>');
        addNameLabel.attr("for", "formGroupExampleInput");

        let addNameInput = $('<input>');
        addNameInput.attr("type", "text");
        addNameInput.attr("class", "form-control");
        addNameInput.attr("id", "nameField"+index);
        addNameInput.attr("placeholder", "ajouter le nom du restaurant ...");

        let addAdress = $('<div>');
        addAdress.attr("class", "form-group col-md-12");

        let addAdressLabel = $('<label>');
        addAdressLabel.attr("for", "formGroupExampleInput");

        let addAdressInput = $('<input>');
        addAdressInput.attr("type", "text");
        addAdressInput.attr("class", "form-control");
        addAdressInput.attr("style", "pointer-events:none");
        addAdressInput.attr("id", "adressField"+index);
        addAdressInput.attr("placeholder", "ajouter l'adresse du restaurant ...");

        let errorContainer = $('<div>');
        errorContainer.attr("id", "errorContainer"+index);

        $("#map").append(modalContainer);

        modalContainer.append(modalDialog);
        modalDialog.append(modalContent);
        modalContent.append(modalHeader);
        modalHeader.append(modalTitle);
        modalTitle.append("Ajouter un restaurant");
        modalContent.append(modalBody);
        modalBody.append(modalNewRestauImg);
        modalContent.append(modalAdvice);
        modalContent.append(formNewRestaurant);
        formNewRestaurant.append(formNewRestaurant);
        formNewRestaurant.append(addName);
        addName.append(addNameLabel);
        addNameLabel.append("Nom :");
        addName.append(addNameInput);
        formNewRestaurant.append(addAdress);
        addAdress.append(addAdressLabel);
        addAdressLabel.append("Adresse :");
        addAdress.append(addAdressInput);
        modalAdvice.append("");
        modalContent.append(errorContainer);
        modalContent.append(modalFooter);
        modalFooter.append(closeModalButton);
        closeModalButton.append("Ajouter");

        $("#newRestaurant"+index).modal('show');
        $("#nameField"+index).val('');
        $("#adressField"+index).prop( "disabled", true);

        this.checkInputIsNull(index, coords);
    }

    //ajout d'un nouveau restaurant sur la carte 
    addRestaurant(index, coords) {
        //créer des index en auto pour générer des modals différents pour chaque marqueur
        this.newRestaurantsByUser.push(coords);
        for(let i = 0; i < this.newRestaurantsByUser.length; i++) {
            if($("#newRestaurant" + index).length == 0) {
                index = i+1;
                let urlImg = "";
                urlImg = global.methods.getImgs(coords.lat(), coords.lng());

                this.generateModalTemplateForNewRestaurant(coords, index, urlImg);  
                
                $(`#newRestaurant${index}`).modal('show'); 
            }
        }
    }

    // création et enregistrement d'un nouvel objet (restaurant) dans un tableau
    saveRestaurant(index, coords, checkValue, restaurantName, address) {
        if (checkValue == true) {
            const restaurantsJSON = new RestaurantsJSON(
                restaurantName,
                "",
                address,
                coords.lat(),
                coords.lng(),
                []
            );
            
            this.newDatas.push(restaurantsJSON);
            global.data.restaurants.push(restaurantsJSON);
                
            let indexOfNewRestaurant = global.data.restaurants.length;
        
            this.newDatas.map((elRestau, indexRestau) => {  
                if(indexRestau + 1 === this.newDatas.length) { // on lit uniquement le dernier index pour ne pas générer de doublons
                    global.methods.displayImgs(restaurantsJSON, elRestau, indexOfNewRestaurant-1); 

                    $('#newRestaurant'+index).remove();
                    $('.modal-backdrop.fade.show').remove();
    
                    const marker = new google.maps.Marker({
                        position: coords,
                        title: 'Nouveau restaurant',
                        map: this.map,
                        draggable: false
                    });
    
                    marker.addListener("click", () => {
                        $(`#restaurantDetails${indexOfNewRestaurant}`).modal('show'); 
                    });
                }
            });

        }
    }

    // vérification de l'input "Name" du formulaire d'ajout d'un restaurant
    checkInputIsNull(index, coords) {
        let self = this;
        let typingTimer;                
        let doneTypingInterval = 1000;  

        $(document).ready( function() {
            $("#nameField"+index).change( function(e) {
                let charactersInput = $(this).val();
                if(charactersInput.length == 0){
                    $("#errorContainer"+index).html("");
                } else {
                    if (charactersInput.length > 3) {
                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(function() {
                            let name = $("#nameField"+index).val();
                            let address = $("#adressField"+index).val();
                            return self.displayErrorMessage(index, false, coords, name, address);
                        }, doneTypingInterval);
                    } else { 
                       return self.displayErrorMessage(index, true, coords);
                    }
                }
            });
        });
    }

    // affichage d'un message d'erreur personnalisé si les champs ne sont pas remplis correctement 
    displayErrorMessage(index, displayValue, coords) {
        if(displayValue == true) {
            $("#errorContainer"+index).html("");
            let typeValueIsRestaurant = true;
            global.methods.templateErrorMessage(index, true, typeValueIsRestaurant);
            $("#saveRestau"+index).prop("disabled", true);
        } else {
            $("#errorContainer"+index).html("");
            $("#saveRestau"+index).prop("disabled", false);
            $("#saveRestau"+index).click(() => {  
                let address = $("#adressField"+index).val();
                let name = $("#nameField"+index).val();
                this.getDetailsRestaurant(index, coords, name, address);
            });
        }
    }

    // récupération et vérification des champs avant enregistrement des valeurs du nouveau restaurant
    getDetailsRestaurant(index, coords ,name, address) {
        if (name.length > 1 && 
            address.length > 1) {
            let saveValue = true;
            this.saveRestaurant(index, coords, saveValue, name, address);
        } else {
            let saveValue = false;
            this.saveRestaurant(index, coords, saveValue, name, address);
        }        
    }

    //ajout d'un marker en fonction du type (si true alors c'est un user ou sinon c'est un restaurant)
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
                position: coords, 
            });
            this.markers.push(marker);
            return marker;
        }
    }

    // Définit la carte sur tous les markers du tableau
    setMapOnAll() {
        for (let i = 0; i < allMarkers.length; i++) {
            allMarkers[i].setMap(this.map);
        }
    }
    
    // Supprime les marqueurs de la carte, mais les conserve dans le tableau
    clearMarkers() {
        this.markers.forEach(marker => {
            marker.setMap(null);
        });
    }

    deleteMarkers() {
        this.clearMarkers();
    }

}