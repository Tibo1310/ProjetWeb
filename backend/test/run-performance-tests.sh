#!/bin/bash

# Script complet pour les tests de performance
# Lance Artillery avec monitoring des ressources

echo "🚀 TESTS DE PERFORMANCE - API GRAPHQL"
echo "======================================"
echo "Timestamp: $(date)"
echo ""

# Vérifications préalables
echo "🔍 Vérifications préalables..."

# Vérifier que le serveur tourne
if ! curl -s http://localhost:3001/graphql > /dev/null; then
    echo "❌ Le serveur n'est pas accessible sur http://localhost:3001"
    echo "   Démarrez le serveur avec: npm run start:dev"
    exit 1
fi
echo "✅ Serveur accessible"

# Vérifier Artillery
if ! command -v artillery &> /dev/null; then
    echo "❌ Artillery non installé"
    echo "   Installez avec: npm install -g artillery"
    exit 1
fi
echo "✅ Artillery disponible"

# Vérifier Docker (pour les stats des containers)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker non disponible - monitoring containers désactivé"
    DOCKER_AVAILABLE=false
else
    echo "✅ Docker disponible"
    DOCKER_AVAILABLE=true
fi

echo ""

# Créer le dossier de rapports
mkdir -p reports/artillery

# Nom du fichier de rapport
REPORT_FILE="reports/artillery/performance_$(date +%Y%m%d_%H%M%S)"

echo "📊 Configuration du test:"
echo "  - Durée totale: ~4 minutes (warmup + ramp + peak + stress)"
echo "  - Charge max: 15 requêtes/seconde"
echo "  - Scénarios: Create User (20%) + Create Conversation (30%) + Send Messages (50%)"
echo "  - Rapport: ${REPORT_FILE}.html"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt des tests..."
    if [ ! -z "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null
    fi
    exit 0
}

# Intercepter CTRL+C
trap cleanup INT

# Démarrer le monitoring en arrière-plan (si on est sur Linux/Mac)
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📈 Démarrage du monitoring des ressources..."
    ./test/performance-monitor.sh &
    MONITOR_PID=$!
    sleep 2
fi

echo "🔥 Lancement des tests Artillery..."
echo ""

# Lancer Artillery avec rapport HTML
artillery run artillery.yml \
    --output "${REPORT_FILE}.json" \
    --config '{"target": "http://localhost:3001/graphql"}' \
    | tee "${REPORT_FILE}.log"

# Générer le rapport HTML
echo ""
echo "📊 Génération du rapport HTML..."
artillery report "${REPORT_FILE}.json" --output "${REPORT_FILE}.html"

# Arrêter le monitoring
if [ ! -z "$MONITOR_PID" ]; then
    kill $MONITOR_PID 2>/dev/null
fi

echo ""
echo "✅ TESTS TERMINÉS !"
echo "=================="
echo "📁 Fichiers générés:"
echo "  - Rapport HTML: ${REPORT_FILE}.html"
echo "  - Logs détaillés: ${REPORT_FILE}.log"
echo "  - Données JSON: ${REPORT_FILE}.json"

if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "  - Monitoring système: reports/performance/metrics_*.log"
fi

echo ""
echo "🎯 MÉTRIQUES CLÉS À ANALYSER:"
echo "  1. Temps de réponse p95/p99 des mutations sendMessage"
echo "  2. Taux d'erreur (doit être < 1%)"  
echo "  3. Débit max supporté (req/sec)"
echo "  4. Utilisation CPU/RAM du serveur"
echo "  5. Performance de la base de données"
echo ""
echo "🌐 Ouvrez le rapport: ${REPORT_FILE}.html" 