class RestaurantsJSON {
    constructor(name, photo, address, lat, lng, stars, comment){
        this.name = name; 
        this.photo = photo; 
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.stars = stars;
        this.comment = comment;
    }

    //Getters

    //on récupére les avis des restaurants ainsique les notes des utilisateurs
    getAdviceFromRestaurantsJSON(numberOfRestau, ratingsRestaurant) {

        for(let j = 0; j < ratingsRestaurant.length; j++) {      

            let adviceTemplate = `
                <div id="advice${j+1}" class="media text-muted pt-3">
                    <p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                    <strong class="d-block text-gray-dark">Note attribuée : ${ratingsRestaurant[j].stars}</strong>
                    ${ratingsRestaurant[j].comment}
                    </p>
                </div>
            `;


            $(`#costumerAdvice${numberOfRestau}`).append(adviceTemplate);
        }
    }

    //afficher la moyenne des notes des restaurants
    displayAverage(restaurants) {
        const sum = Object.values(restaurants.ratings).reduce((acc, current) => acc + current.stars, 0);
        const ratingsAverage = sum / Object.values(restaurants.ratings).length;
        
        return ratingsAverage;
    }

}