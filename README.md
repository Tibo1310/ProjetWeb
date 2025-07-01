# Application de Messagerie Instantanée - Projet Web EFREI 2025
> Développé avec NestJS, GraphQL et RabbitMQ

## Description du Projet
Application de messagerie instantanée inspirée de Facebook Messenger, développée dans le cadre du cours Projet Web à EFREI Paris. Cette application démontre l'utilisation des technologies modernes de développement web et l'implémentation de patterns architecturaux avancés.

## Fonctionnalités Clés
- Création et gestion de profils utilisateurs
- Liste des utilisateurs (tous les profils créés)
- Gestion des conversations
- Détails des conversations et messages en temps réel

## Stack Technologique

### Backend
- **NestJS** : Framework Node.js moderne avec support TypeScript natif
- **GraphQL** : API Query Language avec Apollo Server
- **RabbitMQ** : Message Broker pour la gestion asynchrone des messages
- **TypeScript** : Langage de programmation typé
- **WebSocket** : Pour les communications en temps réel

### Architecture
1. **Client (Web/Mobile)**
   - Interactions via requêtes GraphQL
   - Souscriptions WebSocket pour les mises à jour en temps réel

2. **API NestJS/GraphQL**
   - Queries (getConversations, getUsers, etc.)
   - Mutations (sendMessage, createConversation, etc.)
   - Subscriptions (onMessageSent, onConversationUpdated)

3. **Worker/Listener (Microservice)**
   - Traitement asynchrone des messages via RabbitMQ
   - Persistance en base de données
   - Publication via PubSub GraphQL

## Installation et Démarrage

### Prérequis
- Node.js (v18 ou supérieur)
- Docker et Docker Compose
- npm ou yarn

### Configuration
1. Cloner le repository
```bash
git clone [URL_DU_REPO]
cd [NOM_DU_PROJET]
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos configurations
```

4. Démarrer RabbitMQ
```bash
docker-compose up -d
```

5. Lancer l'application
```bash
npm run start:dev
```

## Tests

### Tests Unitaires
```bash
npm run test
```

### Tests d'Intégration
```bash
npm run test:e2e
```

### Tests de Performance
Utilisation d'Artillery pour les tests de charge :
```bash
npm run test:load
```

## Documentation API

### Queries GraphQL Principales
```graphql
# Récupérer les conversations
query {
  conversations {
    id
    participants {
      id
      username
    }
    messages {
      content
      createdAt
    }
  }
}

# Envoyer un message
mutation {
  sendMessage(input: {
    content: "Hello!"
    conversationId: "123"
    senderId: "456"
  }) {
    id
    content
    createdAt
  }
}

# Souscrire aux nouveaux messages
subscription {
  messageSent {
    id
    content
    sender {
      username
    }
  }
}
```

## Optimisations et Performance

### Gestion du N+1 Problem
- Utilisation de DataLoader pour le batching des requêtes
- Optimisation des requêtes GraphQL

### Mise en Cache
- Cache des utilisateurs fréquemment accédés
- Cache des conversations récentes

### Scalabilité
- Architecture microservices avec RabbitMQ
- Support du clustering RabbitMQ
- Gestion optimisée des WebSockets

## Contribution
Développé par Thibault Delattre dans le cadre du cours de Projet Web à EFREI Paris, supervisé par Jérôme Commaret.

## CI/CD Pipeline

### Configuration

Le projet utilise GitHub Actions pour l'intégration et le déploiement continus. Le pipeline comprend trois étapes principales :

1. **Test Stage**
   - Exécution des tests unitaires
   - Exécution des tests d'intégration
   - Exécution des tests de performance
   - Génération des rapports de couverture

2. **Build Stage**
   - Construction de l'image Docker
   - Push vers Docker Hub
   - Utilisation du cache pour optimiser les builds

3. **Deploy Stage**
   - Déploiement automatique sur Render.com via webhook
   - Déclenchement uniquement sur la branche main/master

### Secrets GitHub Requis

Pour que le pipeline fonctionne, vous devez configurer les secrets GitHub suivants :

```bash
# Pour Docker Hub
DOCKERHUB_USERNAME=votre-username
DOCKERHUB_TOKEN=votre-token

# Pour Render.com
RENDER_DEPLOY_HOOK_URL=votre-url-webhook-render
```

Pour obtenir ces secrets :
1. **Docker Hub** :
   - Créez un compte sur Docker Hub
   - Générez un token d'accès dans les paramètres de sécurité
   - Ajoutez votre username et le token dans les secrets GitHub

2. **Render.com** :
   - Dans votre dashboard Render, allez dans le service concerné
   - Dans l'onglet "Settings", trouvez "Deploy Hook"
   - Copiez l'URL du webhook et ajoutez-la dans les secrets GitHub

### Déploiement Local

Pour exécuter l'application localement avec Docker :

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Monitoring

Le pipeline inclut :
- Rapports de tests automatisés
- Métriques de performance
- Logs de déploiement
