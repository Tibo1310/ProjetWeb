# 🚀 Guide des Tests de Performance

Ce guide explique comment tester les performances de l'API GraphQL avec Artillery.

## 🎯 Objectifs des Tests

### Métriques clés à mesurer :
1. **Temps de réponse** de la mutation `sendMessage`
2. **Latence** de réception des messages 
3. **Utilisation CPU/Mémoire** du serveur API
4. **Performance RabbitMQ** sous charge
5. **Capacité maximale** (req/sec)

### Seuils de performance cibles :
- ✅ **P95 < 500ms** (95% des requêtes sous 500ms)
- ✅ **P99 < 1000ms** (99% des requêtes sous 1s) 
- ✅ **Taux d'erreur < 1%**
- ✅ **Débit minimum : 10 req/sec**

## 🛠️ Prérequis

### 1. Démarrer les services
```bash
# Démarrer Docker Compose (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Démarrer le serveur NestJS
npm run start:dev
```

### 2. Vérifier l'installation
```bash
# Artillery doit être installé
artillery --version

# Le serveur doit répondre
curl http://localhost:3001/graphql
```

## 🏃‍♂️ Lancer les Tests

### Option 1: Tests complets avec monitoring
```bash
# Script automatisé avec monitoring système
chmod +x test/run-performance-tests.sh
./test/run-performance-tests.sh
```

### Option 2: Artillery simple
```bash
# Test basique
npm run test:load

# Test avec rapport HTML
npm run test:load:report
```

### Option 3: Tests personnalisés
```bash
# Test court (1 minute)
artillery quick --count 10 --num 5 http://localhost:3001/graphql

# Test avec configuration custom
artillery run artillery.yml --environment staging
```

## 📊 Scénarios de Test

### Configuration actuelle (`artillery.yml`) :

#### **Phase 1: Warmup** (30s)
- 2 utilisateurs/seconde
- Préchauffage du système

#### **Phase 2: Ramp up** (60s) 
- 5 utilisateurs/seconde
- Montée en charge progressive

#### **Phase 3: Peak load** (60s)
- 10 utilisateurs/seconde  
- Charge nominale

#### **Phase 4: Stress test** (30s)
- 15 utilisateurs/seconde
- Test de limite

### **Scénarios testés :**

1. **Create User** (20% du traffic)
   - Création d'utilisateurs uniques
   - Test de la base de données

2. **Create Conversation** (30% du traffic)
   - Création d'utilisateurs + conversations
   - Test des relations DB

3. **Send Message** (50% du traffic) ⭐ **PRINCIPAL**
   - Setup complet (users + conversation)
   - Envoi de 5 messages par session
   - Test de RabbitMQ et performance globale

## 📈 Analyser les Résultats

### 1. Rapport HTML Artillery
```bash
# Ouvrir le rapport généré
open reports/artillery/performance_YYYYMMDD_HHMMSS.html
```

**Métriques importantes :**
- **Response time P95/P99** : Latence au 95e/99e percentile
- **Request rate** : Nombre de requêtes/seconde
- **Error rate** : Pourcentage d'erreurs
- **Throughput** : Débit effectif

### 2. Monitoring Système
```bash
# Voir les logs de monitoring (Linux/Mac)
cat reports/performance/metrics_*.log
```

**Ressources surveillées :**
- CPU/RAM du processus Node.js
- CPU/RAM des containers Docker
- Load average du système

### 3. Logs de l'Application
```bash
# Surveiller les logs en temps réel pendant les tests
npm run start:dev
```

## 🎯 Interpréter les Résultats

### ✅ **Résultats acceptables :**
```
Scenarios launched: 1000+
Response time P95: < 500ms
Response time P99: < 1000ms  
Error rate: < 1%
Request rate: > 10 req/s
```

### ⚠️ **Signaux d'alerte :**
```
Response time P95: > 1000ms  → Base de données lente
Error rate: > 5%             → Instabilité système  
HTTP 500 errors              → Bugs sous charge
Timeouts                     → Surcharge serveur
```

### 🔧 **Optimisations possibles :**

#### **Si latence élevée :**
- Indexer la base de données
- Optimiser les requêtes GraphQL
- Ajouter du cache Redis
- Pool de connexions DB

#### **Si erreurs nombreuses :**
- Augmenter les timeouts
- Vérifier la gestion d'erreur
- Surveiller les logs d'erreur
- Limite de connexions DB

#### **Si CPU élevé :**
- Profiler le code Node.js
- Optimiser les resolvers GraphQL  
- Pagination des requêtes
- Clustering Node.js

## 🔄 Tests en Continu

### GitHub Actions
Les tests de performance sont automatisés dans `.github/workflows/ci-cd.yml` :

```yaml
- name: Run Performance Tests
  working-directory: ./backend
  env:
    DATABASE_URL: postgresql://user:password@localhost:5432/chat_db
    # ... autres variables
  run: npm run test:load
```

### Seuils d'échec
Si les performances se dégradent, le CI/CD échouera automatiquement.

## 📚 Ressources

- [Documentation Artillery](https://artillery.io/docs/)
- [GraphQL Performance Best Practices](https://graphql.org/learn/best-practices/)
- [NestJS Performance Tips](https://docs.nestjs.com/techniques/performance)

---

## 🚨 Troubleshooting

### Problème : "ECONNREFUSED"
```bash
# Vérifier que le serveur tourne
curl http://localhost:3001/graphql
npm run start:dev
```

### Problème : Artillery non trouvé
```bash
# Installer Artillery globalement
npm install -g artillery

# Ou utiliser npx
npx artillery run artillery.yml
```

### Problème : Permissions script
```bash
# Rendre exécutable
chmod +x test/run-performance-tests.sh
chmod +x test/performance-monitor.sh
```

### Problème : Tests trop lents
```bash
# Réduire la durée dans artillery.yml
phases:
  - duration: 10  # au lieu de 60
    arrivalRate: 2
``` 