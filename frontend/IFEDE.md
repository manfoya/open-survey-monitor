# IFEDE.md

- [x] Protection des routes (et des composants): Role guard
- [ ] Gérer la désynchronisation entre les durées de vie de l'access-token et gestion de l'expiration de la session
- [x] Les modules app/dashboard et features/dashboard sont à revoir
- [x] Déplacer le layout à un layout global (mais pas directement dans @/app)
- [x] Penser à un bouton de switch du theme (ligth, dark, system): 
  le mettre au coin supérieur droit
- [x] Rajouter des champs pour faire une AppSideBar contenant (Overview, Recherche,
   Users, Zones, Missions, Dictionnaires, Paramètres, Mon Profil)
- [x] Définir clairement les autorisations (rendering conditionné): par ex. certaines 
  options du menu peuvent être manquantes chez un agent (notamment Recherche)
- [ ] Sur les pages qui présentent des données (GET), mettre des boutons de modification 
  ou des liens vers les pages pour modifier
- [ ] Centraliser tous les types (surtout ceux qui dépendent du backend)

## Fonctionnalité en cours
- Création d'un utilisateur (achevé)
- Mise à jour (correctement faire la requete vers l'API, la route n'existant pas encore)
