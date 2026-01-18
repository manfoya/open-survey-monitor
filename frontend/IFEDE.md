# IFEDE.md

- [x] Protection des routes (et des composants): Role guard
- [x] Les modules app/dashboard et features/dashboard sont à revoir
- [x] Déplacer le layout à un layout global (mais pas directement dans @/app)
- [x] Penser à un bouton de switch du theme (ligth, dark, system):
      le mettre au coin supérieur droit
- [x] Rajouter des champs pour faire une AppSideBar contenant (Overview, Recherche,
      Users, Zones, Missions, Dictionnaires, Paramètres, Mon Profil)
- [x] Définir clairement les autorisations (rendering conditionné): par ex. certaines
      options du menu peuvent être manquantes chez un agent (notamment Recherche)
- [x] Sur les pages qui présentent des données (GET), mettre des boutons de modification
      ou des liens vers les pages pour modifier
- [x] Duplication d'information sur la page de détails d'une zone
- [x] Vérifier les autorisations avant d'afficher les boutons modifier, créer, et supprimer: utiliser un RoleGuard pour n'afficher les boutons que le directeur; empecher l'accès direct par URL en verifiant les permissions (roles ici) avant d'afficher la page.

- [ ] Gérer la désynchronisation entre les durées de vie de l'access-token et gestion de l'expiration de la session
- [ ] Centraliser tous les types (surtout ceux qui dépendent du backend)

## Fonctionnalité en cours

- Vérifier le bon fonctionnement des routes pour les zones

- Rendre ce tableau de users personnalisable (en choisissant les champs à afficher)
- La pagination doit gérer le cas où page est trop grand ou trop petit
