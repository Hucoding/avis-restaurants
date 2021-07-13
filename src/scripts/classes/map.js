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
                        console.log(results[i].rating);
                        this.place = this.createObject(
                            results[i].name, 
                            "", 
                            results[i].vicinity, 
                            Number(results[i].geometry.location.lat().toFixed(7)), 
                            Number(results[i].geometry.location.lng().toFixed(7)), 
                            [results[i].rating], 
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

        let modal = `
            <div id="newRestaurant${index}" class="modal fade show" aria-modal="true" role="dialog" style="display: block; padding-left: 0px;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header d-flex justify-content-center">
                            <h1>Ajouter un restaurant</h1>
                        </div>
                    <div class="modal-body d-flex justify-content-center">
                        <img id="modalNewRestauImg${index}" class="col-md-12 modalNewRestauImg" src=${urlImg}>
                    </div>
                    <div id="costumerAdviceNewRestau${index}" class="costumerAdviceNewRestau"></div>
                    <form id="from1">
                        <div class="form-group col-md-12">
                            <label for="formGroupExampleInput">Nom :</label>
                            <input type="text" class="form-control" id="nameField${index}" placeholder="ajouter le nom du restaurant ...">
                        </div>
                        <div class="form-group col-md-12">
                            <label for="formGroupExampleInput">Adresse :</label>
                            <input type="text" class="form-control" style="pointer-events:none" id="adressField${index}" placeholder="ajouter l'adresse du restaurant ..." disabled="">
                        </div>
                    </form>
                    <div id="errorContainer1"></div>
                    <div class="modal-footer modal-footer--mine">
                        <button id="saveRestau${index}" type="button" class="btn btn-default" data-dismiss="modal" disabled="disabled">Ajouter</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        $("#map").append(modal);

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