# ProjetWeb - Application Web

## Description
Application web développée dans le cadre du cours Projet Web: Déploiement, Nest.js, GraphQL, Message Queuing et Tests. L'objectif est de créer une messagerie instantanée avec déploiement continu.

## Fonctionnalités


## Technologies Utilisées


## Setup
### Prérequis
- Node.js
- VSCode
- Git

### Installation
1. Cloner le repository
```bash
git clone https://github.com/Tibo1310/ProjetWeb
```

2. Installer les dépendances
```bash
npm install
```

3. Lancer l'application
```bash
npm start
```

4. Lancer le backend en mode développement
```bash
cd backend
npm run start:dev
```

5. Tester les endpoints

- Health Check (REST API):
  - URL: http://localhost:3000/health
  - Méthode: GET
  - Réponse attendue: `{"status":"OK","jobId":"1"}`

- GraphQL API:
  - URL: http://localhost:3000/graphql
  - Interface GraphQL Playground: Ouvrez l'URL dans votre navigateur
  - Test avec Postman:
    - Méthode: POST
    - Body > GraphQL (pour la derniere version) :
    ```graphql
    query {
      status {
        result
      }
    }
    ```
    ou
    - Body > Raw > JSON (pour ancienne version de postman) :
     ```{
       "query": "query { status { result } }"
     }
     ```
    - Réponse attendue:
    ```json
    {
      "data": {
        "status": {
          "result": "ok"
        }
      }
    }
    ```

## Contribution
- Thibault Delattre

## Implémentation Détaillée

### 1. Architecture Backend
Le backend est construit avec NestJS et utilise les technologies suivantes :
- **GraphQL** pour l'API principale
- **Bull** pour la gestion des files d'attente de messages
- **Redis** comme broker de messages
- **Jest** pour les tests unitaires
- **Newman/Postman** pour les tests d'intégration

### 2. Structure du Projet
Le backend est organisé en modules :
- `users` : Gestion des utilisateurs et de leurs statuts
- `conversations` : Gestion des conversations et des messages
- `health` : Endpoints de surveillance de l'application
- `graphql` : Configuration et resolvers GraphQL

### 3. Tests
#### Tests Unitaires
- Tests des services (UsersService, ConversationsService)
- Tests des contrôleurs (HealthController)
- Tests des resolvers GraphQL (StatusResolver)
- Couverture de code complète

#### Tests d'Intégration
Collection Postman testant :
- Health Check endpoint
- GraphQL Status Query
- Création d'utilisateurs
- Création de conversations
- Envoi de messages

### 4. CI/CD Pipeline
Pipeline GitHub Actions comprenant :
1. **Test Stage** :
   - Exécution des tests unitaires
   - Démarrage d'un conteneur Redis pour les tests
   - Exécution des tests d'intégration
   - Génération et sauvegarde des rapports de tests

2. **Build Stage** :
   - Construction de l'image Docker
   - Push vers Docker Hub avec versioning
   - Utilisation du cache pour optimisation

3. **Deploy Stage** :
   - Déploiement automatique sur Render.com
   - Déclenchement uniquement sur la branche master
   - Utilisation de webhooks pour le déploiement

### 5. Monitoring et Santé
- Endpoint `/health` pour la surveillance
- Intégration avec Bull pour la gestion des files d'attente
- Logs et métriques pour le suivi des performances

### 6. Sécurité
- Protection CSRF désactivée pour le développement
- Configuration sécurisée de GraphQL
- Gestion des secrets via GitHub Secrets

### 7. Commandes Importantes

#### Développement
```bash
# Démarrer l'application en mode développement
npm run start:dev

# Démarrer l'application en mode debug
npm run start:debug

# Démarrer l'application en mode production
npm run start:prod
```

#### Tests
```bash
# Exécuter les tests unitaires
npm test

# Exécuter les tests unitaires avec couverture
npm run test:cov

# Exécuter les tests unitaires en mode watch
npm run test:watch

# Exécuter les tests d'intégration avec Newman/Postman
npm run test:integration

# Exécuter les tests end-to-end
npm run test:e2e
```

#### Autres Commandes
```bash
# Compiler l'application
npm run build

# Formater le code
npm run format

# Linter le code
npm run lint
```

#### Docker
```bash
# Construire l'image
docker build -t projetweb-backend .

# Démarrer le conteneur
docker run -p 3000:3000 projetweb-backend

# Démarrer avec Docker Compose (inclut Redis)
docker-compose up
```

----------------------------

## 1 - Etude de faisabilité

### NestJS

NestJS est un framework Node.js progressif pour la construction d'applications côté serveur efficaces et évolutives. Principales caractéristiques de NestJS:

#### Architecture Modulaire
- **Modules** : Unités de base qui encapsulent des fonctionnalités connexes
- **Controllers** : Gestion des requêtes HTTP et délégation aux services
- **Services** : Logique métier et interaction avec la base de données
- **Providers** : Injection de dépendances pour une meilleure modularité
- **Pipes** : Validation et transformation des données
- **Guards** : Gestion de l'authentification et des autorisations
- **Interceptors** : Manipulation des requêtes/réponses

#### Avantages de NestJS
1. **TypeScript natif** : Typage fort et meilleure maintenabilité
2. **Architecture SOLID** : Principes de conception robustes
3. **Extensibilité** : Large écosystème de modules
4. **Support GraphQL intégré** : Parfait pour notre cas d'usage
5. **Tests automatisés** : Outils de test intégrés

### GraphQL

GraphQL est un langage de requête pour les APIs qui présente plusieurs avantages et inconvénients pour notre projet de messagerie instantanée :

#### Avantages
1. **Requêtes flexibles** :
   - Les clients peuvent demander exactement les données dont ils ont besoin
   - Réduction de la sur-récupération ou sous-récupération de données
   - Particulièrement utile pour les messages avec différents niveaux de détail

2. **Performance optimisée** :
   - Une seule requête pour obtenir des données reliées
   - Réduction du nombre de requêtes réseau
   - Idéal pour les conversations avec messages, utilisateurs et pièces jointes

3. **Temps réel** :
   - Support natif des subscriptions
   - Parfait pour la messagerie instantanée
   - Mise à jour en temps réel des conversations

4. **Documentation automatique** :
   - Schéma auto-documenté
   - Introspection intégrée
   - Facilite le développement front-end

#### Inconvénients
1. **Complexité initiale** :
   - Courbe d'apprentissage plus raide
   - Configuration plus complexe
   - Nécessite une bonne compréhension des concepts

2. **Cache** :
   - Gestion du cache plus complexe
   - Nécessite une stratégie de mise en cache adaptée

3. **Sécurité** :
   - Risque de requêtes trop coûteuses
   - Nécessite la mise en place de limitations
   - Protection contre les attaques par requêtes complexes

4. **Monitoring** :
   - Outils de surveillance spécifiques nécessaires
   - Métriques différentes des APIs REST

### Conclusion
Pour notre projet de messagerie instantanée, la combinaison NestJS/GraphQL est particulièrement adaptée :
- Architecture modulaire de NestJS pour une base solide
- Capacités temps réel de GraphQL pour la messagerie instantanée
- Support natif de TypeScript pour la sécurité du type
- Excellent support des tests pour l'intégration continue
