# Avis-restaurants

Vous avez choisi de vous lancer dans le business des avis de restaurants. Votre objectif : créer un service simple et utile qui permet d'avoir des avis sur des restaurants autour de soi.

Pour ce projet, vous allez devoir apprendre à utiliser des API externes, telles que celles de Google Maps et de Google Places (votre plus gros concurrent ;) ). Et ce n'est pas tout : vous allez devoir orchestrer toutes ces informations de manière cohérente dans votre application !

Etape 1 : la carte des restaurants
Commencez par les fondations de votre application. Il y aura 2 sections principales :

Une carte Google Maps, chargée avec l'API de Google Maps

Une liste de restaurants correspondant à la zone affichée sur la carte Google Maps

Vous placerez ces éléments côte à côte.

La carte Google Maps sera centrée immédiatement sur la position de l'utilisateur. Vous utiliserez l'API de géolocalisation de JavaScript. Un marqueur de couleur spécifique sera placé à l'emplacement de l'utilisateur.

Une liste de restaurants est fournie sous forme de données JSON présentées dans un fichier à part. En temps normal, ces données vous seraient renvoyés par un backend via une API, mais pour cet exercice il sera pour le moment suffisant de charger en mémoire tous les restaurants en mémoire directement.

Voici un exemple de fichier JSON avec déjà 2 restaurants pré-remplis (vous devriez en ajouter un peu plus) :

[
   {
      "restaurantName":"Bronco",
      "address":"39 Rue des Petites Écuries, 75010 Paris",
      "lat":48.8737815,
      "long":2.3501649,
      "ratings":[
         {
            "stars":4,
            "comment":"Un excellent restaurant, j'y reviendrai ! Par contre il vaut mieux aimer la viande."
         },
         {
            "stars":5,
            "comment":"Tout simplement mon restaurant préféré !"
         }
      ]
   },
   {
      "restaurantName":"Babalou",
      "address":"4 Rue Lamarck, 75018 Paris",
      "lat":48.8865035,
      "long":2.3442197,
      "ratings":[
         {
            "stars":5,
            "comment":"Une minuscule pizzeria délicieuse cachée juste à côté du Sacré choeur !"
         },
         {
            "stars":3,
            "comment":"J'ai trouvé ça correct, sans plus"
         }
      ]
   }
]
Affichez ces restaurants grâce à leurs coordonnées GPS sur la carte. Les restaurants qui sont actuellement visibles sur la carte doivent être affichés sous forme de liste sur le côté de la carte. Vous afficherez la moyenne des commentaires de chaque restaurant (qui va de 1 à 5 étoiles).

Lorsqu'on clique sur un restaurant, la liste des avis enregistrés s'affiche avec les commentaires. Affichez aussi la photo Google Street View grâce à l'API correspondante.

Un outil de filtre permet d'afficher uniquement les restaurants ayant entre X et Y étoiles. La mise à jour de la carte s'effectue en temps réel.

Fichiers à fournir :

Code HTML / CSS / JS du projet

Etape 2 : ajoutez des restaurants et des avis !
Vos visiteurs aimeraient eux aussi donner leur avis sur des restaurants !Proposez-leur :

D'ajouter un avis sur un restaurant existant

D'ajouter un restaurant, en cliquant sur un lieu spécifique de la carte

Une fois un avis ou un restaurant ajouté, il apparaît immédiatement sur la carte. Un nouveau marqueur apparaît pour indiquer la position du nouveau restaurant.

Les informations ne seront pas sauvegardées si on quitte la page (elles restent juste en mémoire le temps de la visite).

Fichiers à fournir :

Code HTML / CSS / JS du projet

Etape 3 : intégration avec l'API de Google Places
Pour l'instant, il n'y a pas beaucoup de restaurants et pas beaucoup d'avis. Heureusement, Google Places propose une API pour récupérer des restaurants et des avis. Servez-vous en pour afficher des restaurants et avis supplémentaires sur votre carte ! Ici la documentation : https://developers.google.com/places/



Vous utiliserez la search api pour trouver des restaurants dans la zone affichée.

Lisez bien la documentation pour savoir comment accéder aux données de Google Places et n'hésitez pas à faire autant de recherches Google que nécessaire quand vous butez sur un problème. ;)
L'API ne coûte que très peu cher à l'utilisation (quelques euros par milliers de requêtes). Mais attention à ne pas faire trop de requêtes d'un coup (à cause d'une boucle infinie par exemple). La facture d'utilisation de l'API pourrait s'élever rapidement !

Livrables
Fichier à fournir :

Code HTML/CSS/JS du projet

Pour faciliter votre passage au jury, déposez sur la plateforme, dans un dossier nommé “P7_nom_prenom”, tous les livrables du projet. Chaque livrable doit être nommé avec le numéro du projet et selon l'ordre dans lequel il apparaît, par exemple “P7_01_code”.

Soutenance
Vous présenterez votre projet à l'oral. La soutenance se déroulera comme suit :

Présentation de votre code et du site : 10-15 minutes
Un moment questions-réponses : 10 minutes
Votre évaluateur débriefera avec vous pendant 5 minutes à la fin de la soutenance. 

 

Compétences évaluées
Développer une application JavaScript complète en respectant un cahier des charges
Utiliser une API externe en JavaScript




=> Validation W3C du fichier index.html
<img width="1621" alt="Capture d’écran 2021-07-12 à 14 38 10" src="https://user-images.githubusercontent.com/53316189/125289914-0e1a5f00-e320-11eb-979e-b4446847ca11.png">
