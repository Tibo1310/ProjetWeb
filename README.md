# Application de Messagerie Instantanée - Projet Web EFREI 2025
> Application de chat temps réel avec NestJS, GraphQL, React et RabbitMQ

## 🎯 Fonctionnalités

- **Gestion des utilisateurs** : Inscription, connexion, profils
- **Conversations** : Création de conversations entre utilisateurs
- **Messages temps réel** : Envoi/réception instantanée via WebSockets (non fonctionnel actuellement)
- **Performance optimisée** : Cache Redis, rate limiting, optimisations GraphQL

## 🛠 Stack Technique

### Backend
- **NestJS** + **TypeScript** : API REST/GraphQL
- **GraphQL** avec Apollo Server : API flexible et typée
- **PostgreSQL** : Base de données relationnelle
- **Redis** : Cache et sessions
- **RabbitMQ** : Message queue pour le temps réel
- **TypeORM** : ORM avec support migrations

### Frontend
- **React** + **TypeScript** : Interface utilisateur
- **Apollo Client** : Client GraphQL avec cache
- **React Router** : Navigation côté client

### DevOps
- **Docker Compose** : Orchestration des services
- **GitHub Actions** : CI/CD pipeline
- **Artillery** : Tests de performance
- **Jest** : Tests unitaires et e2e

## 🚀 Installation et Démarrage

### Prérequis
```bash
node --version  # v18+
npm --version   # v8+
docker --version && docker-compose --version
git --version
```

### 1. Cloner et installer les dépendances

```bash
# Cloner le repo
git clone https://github.com/Tibo1310/ProjetWeb
cd ProjetWeb

# Backend
cd backend
npm install
cd ..

# Frontend  
cd frontend
npm install
cd ..
```

### 2. Configuration de l'environnement

Créer le fichier `.env` dans le dossier `backend/` :


Contenu du `.env` :
```env
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/chat_db
REDIS_HOST=localhost
REDIS_PORT=6379
RABBITMQ_URL=amqp://user:password@localhost:5672
```

### 3. Démarrer les services externes

```bash
# Build 
docker-compose up --build

# Démarrer PostgreSQL, Redis et RabbitMQ
docker-compose up -d

# Vérifier que tous les services sont up
docker-compose ps
```

Les services exposent les ports :
- **PostgreSQL** : `5432`
- **Redis** : `6379` 
- **RabbitMQ** : `5672` (AMQP) + `15672` (Management UI)

### 4. Lancer l'application

#### Backend (Terminal 1 - se lance avec Docker)
```bash
docker-compose up -d 
```
✅ API disponible sur `http://localhost:3001/graphql`

#### Frontend (Terminal 2 - se lance manuellement)
```bash
cd frontend
npm start
```
✅ Interface disponible sur `http://localhost:3000`

## 📊 Interface GraphQL

Accédez à `http://localhost:3001/graphql` pour le playground GraphQL.

### Exemples de requêtes

**Créer un utilisateur :**
```graphql
mutation {
  createUser(createUserInput: {
    username: "john_doe"
    email: "john@example.com"
    password: "password123"
  }) {
    id
    username
    email
    isOnline
  }
}
```

## 🧪 Tests

### Tests unitaires
```bash
cd backend
npm test                 # Tests unitaires avec Jest
npm run test:cov         # Avec couverture de code
npm run test:watch       # Mode watch pour le développement
```

### Tests d'intégration (E2E)
```bash
cd backend
npm run test:e2e         # Linux/Mac
npm run test:e2e:win     # Windows PowerShell
```

### Tests de performance
```bash
cd backend
npm run test:performance  # Tests de charge avec Artillery

# Ou manuellement
npx artillery run artillery.yml
```

Cibles de performance :
- **P95 < 500ms**
- **P99 < 1000ms** 
- **Taux d'erreur < 1%**
- **Débit > 500 req/s**

## 🔧 Scripts de développement

### Backend
```bash
npm run start:dev        # Mode développement (hot reload)
npm run start:prod       # Mode production
npm run build           # Build TypeScript vers dist/
npm run format          # Prettier formatting
npm run lint            # ESLint
npm run test:debug      # Tests en mode debug
```

### Frontend
```bash
npm start               # Serveur de développement (port 3000)
npm run build           # Build de production vers build/
npm test                # Tests Jest
npm run eject           # Ejecter la config Create React App (irréversible)
```

## 🐳 Docker

### Développement avec Docker
```bash
# Démarrer tous les services (app + dépendances)
docker-compose up --build

# En arrière-plan
docker-compose up -d --build

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Arrêter et nettoyer
docker-compose down -v
```

### Production
```bash
# Build optimisé pour la production
docker-compose -f docker-compose.prod.yml up --build
```

## 🚨 Résolution de problèmes

### Port déjà utilisé
```bash
# Identifier le processus sur le port 3001
lsof -i :3001        # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Tuer le processus
npx kill-port 3001
```

### Base de données non accessible
```bash
# Redémarrer les services Docker
docker-compose down
docker-compose up -d

# Vérifier les logs PostgreSQL
docker-compose logs postgres

# Se connecter manuellement à PostgreSQL
docker exec -it $(docker-compose ps -q postgres) psql -U user -d chat_db
```

### Cache Redis
```bash
# Vider le cache Redis
docker exec -it $(docker-compose ps -q redis) redis-cli FLUSHALL

# Monitorer Redis
docker exec -it $(docker-compose ps -q redis) redis-cli MONITOR
```

### Problèmes npm
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📁 Architecture du projet

```
ProjetWeb_ThibaultDelattre/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── users/             # Module utilisateurs
│   │   ├── conversations/     # Module conversations  
│   │   ├── auth/             # Authentification
│   │   ├── cache/            # Service cache Redis
│   │   ├── pubsub/           # WebSocket events
│   │   └── rabbitmq/         # Message queue
│   ├── test/                 # Tests E2E
│   ├── artillery.yml         # Config tests performance
│   └── docker-compose.yml    # Services externes
├── frontend/                  # App React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/           # Pages/routes
│   │   └── apollo/          # Config GraphQL client
│   └── public/
└── .github/workflows/        # CI/CD GitHub Actions
```

## 🚀 Déploiement

### Variables d'environnement pour la production
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@prod-host:5432/chat_db
REDIS_URL=redis://prod-redis:6379
RABBITMQ_URL=amqp://user:password@prod-rabbitmq:5672
```

### GitHub Actions

Le pipeline CI/CD se déclenche sur :
- **Push** sur `main` : Tests + Build + Deploy
- **Pull Request** : Tests uniquement

Étapes :
1. **Test** : Tests unitaires, E2E et performance
2. **Build** : Images Docker optimisées
3. **Deploy** : Déploiement automatique via webhook

### Secrets GitHub requis
```bash
DOCKERHUB_USERNAME      # Username Docker Hub
DOCKERHUB_TOKEN         # Token d'accès Docker Hub  
```

## 🎯 Optimisations implémentées

### Performance Backend
- **Cache Redis** : Utilisateurs fréquemment accédés (TTL: 5min)
- **Rate Limiting** : 20 req/s, 200 req/min, 1000 req/15min
- **Connection Pooling** : PostgreSQL (5-20 connexions)
- **GraphQL Caching** : Resolvers cachés avec invalidation intelligente

### Performance Frontend
- **Apollo Cache** : Cache automatique des requêtes GraphQL
- **Code Splitting** : Chargement lazy des routes
- **Optimistic Updates** : UI réactive avant confirmation serveur

## 📊 Monitoring

### Métriques disponibles
- **Logs structurés** : Winston avec niveaux debug/info/error
- **Performance** : Artillery reports dans `/tmp/performance-*`
- **Santé des services** : `docker-compose ps` + health checks

### Endpoints de monitoring
```bash
GET /health              # Health check API
GET /metrics            # Métriques Prometheus (si activé)
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commit : `git commit -m 'feat: ajouter ma fonctionnalité'`
4. Push : `git push origin feature/ma-fonctionnalite`  
5. Ouvrir une Pull Request

### Standards de code
- **ESLint** + **Prettier** pour le formatting
- **Conventional Commits** pour les messages
- **Tests obligatoires** pour les nouvelles fonctionnalités
- **Coverage minimum** : 80%

---

**Développé par Thibault Delattre - EFREI Paris 2025**
