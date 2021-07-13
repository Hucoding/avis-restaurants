class RestaurantsJSON {
    constructor(restaurantName, photo, address, lat, lng, ratings, comment, stars) {
        this.restaurantName = restaurantName; 
        this.photo = photo; 
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.ratings = ratings; //total des notes
        this.comment = comment;
        this.stars = stars; //note du commentaire
    }

    //on récupére les avis des restaurants ainsiq ue les notes des utilisateurs
    getAdviceFromRestaurantsJSON(numberOfRestau, ratingsRestaurant) {

        if(ratingsRestaurant.length == 0) {

            $(`#costumerAdvice${numberOfRestau}`).html('');

            let adviceTemplate = 
            `<p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                <strong class="d-block text-gray-dark">
                    il n'y a pas de commentaires pour cet établissement
                </strong>
            </p>`;

            $(`#costumerAdvice${numberOfRestau}`).append(adviceTemplate);

        } else {

            $(`#costumerAdvice${numberOfRestau}`).html('');

            for(let j = 0; j < ratingsRestaurant.length; j++) {  

                if (ratingsRestaurant[j].comment == "" && ratingsRestaurant[j].stars > 0) {
                    $(`#costumerAdvice${numberOfRestau}`).html('');
                    let adviceTemplate = 
                    `<p id="onlyRatingNoComment${numberOfRestau}" class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                        <strong class="d-block text-gray-dark">
                            il n'y a pas de commentaires pour cet établissement
                        </strong>
                    </p>`;
                    $(`#costumerAdvice${numberOfRestau}`).append(adviceTemplate);
                } else {
                    $(`#onlyRatingNoComment${numberOfRestau}`).remove();
                    let adviceTemplate = `
                    <div id="advice${j+1}" class="media text-muted pt-3">
                        <p class="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
                        <strong class="d-block text-gray-dark">Note attribuée : ${ratingsRestaurant[j].stars}</strong>
                        ${ratingsRestaurant[j].comment}
                        </p>
                    </div>`;
                    $(`#costumerAdvice${numberOfRestau}`).append(adviceTemplate);
                }

            }

        }
    }

    //Méthode pour afficher la moyenne des notes des restaurants
    displayAverage(restaurants) {

        const sum = Object.values(restaurants.ratings).reduce((acc, current) => acc + current.stars, 0);
        const ratingsAverage = sum / Object.values(restaurants.ratings).length;
        let finalResult = ratingsAverage.toFixed(1);
        
        return Number(finalResult);

    }

}