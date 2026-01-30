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

### La page Overview
(Aucun détail précis là-dessus pour le moment)

### Users
- Lors de la création d'un utilisateur, si le rôle est "controleur", faire apparaître un champ sélection de la zone à affecter (implique une requête vers le backend à cet effet)
- Ce champ doit aussi apparaître dans la page de modification des utilisateurs
- Pour la page de détails d'un utilisateur, il faut prévoir l'affichage un champ pour afficher la zone dans laquelle il est affecté (ceci ne concerne que les agents et contrôleurs)
- Dans le tableau qui affiche en lignes les détails des utilisateurs rajoutés une colonne zone (alimenté par zone {id, name} fourni par le backend à cet effet); directeur et superviseurs ne sont pas concernés donc ce champ sera nul et dans le tableau un "-" ou "N/A" suffira à le préciser
- 


### Variables (*)
- Implémentation de la création de variables (déjà commencé, review, refactor et binding avec le backend au travers de servers actions)
- Implémentation de la consultation de toutes les variables dans une structure tabulaire + suppression
- Implémentation de la consultation et modification d'une variable (et liaision avec le backend)
  
### Quotas (*)
- Opérations diverses de création de quotas, de suppression, de modification et autres
- 

### Affectations
- Attribution de zone à un controleur (à faire sur les pages de création et de modification d'utilisateur)




## Améliorations
- La pagination doit gérer le cas où page est trop grand ou trop petit
- (dev) Utiliser `urlcat` pour éviter les problèmes avec les slashs
- Pouvoir filtrer spécialement selon les rôles


## Fonctionnalités futures
- Pour le moment, toutes les données sont centralisées autour d'une seule enquête. Il faudra prévoir le cas où il y a plusieurs enquêtes. Seule les interfaces du directeur devraient être concernées par ce changement. En effet, le backend déterminera pour les autres utilisateurs la seule enquête à laquelle ils ont accès et les interfaces n'auront qu'à afficher les données de cette enquête.
Mais pour le directeur, il faudra prévoir un moyen de sélectionner l'enquête à laquelle il veut accéder. On pourrait par exemple mettre un sélecteur d'enquête dans la barre latérale. Un composant de sélection d'enquete sera chargera à son changement d'ajouter une searchParam "surveyId" à l'URL et de recharger la page.
