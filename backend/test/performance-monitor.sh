#!/bin/bash

# Script de monitoring des performances pendant les tests Artillery
# Surveille CPU, mémoire du serveur API et RabbitMQ

echo "🚀 Démarrage du monitoring des performances..."
echo "Timestamp: $(date)"
echo "=============================================="

# Créer le dossier de rapports s'il n'existe pas
mkdir -p reports/performance

# Fichier de log des métriques
METRICS_FILE="reports/performance/metrics_$(date +%Y%m%d_%H%M%S).log"

# Fonction pour logger les métriques
log_metrics() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') | $1" >> $METRICS_FILE
}

# Fonction pour obtenir les stats du processus Node.js
get_node_stats() {
    local node_pid=$(pgrep -f "node.*nest")
    if [ ! -z "$node_pid" ]; then
        local cpu=$(ps -p $node_pid -o %cpu --no-headers | tr -d ' ')
        local mem=$(ps -p $node_pid -o %mem --no-headers | tr -d ' ')
        local rss=$(ps -p $node_pid -o rss --no-headers | tr -d ' ')
        echo "NODE_JS | PID:$node_pid | CPU:${cpu}% | MEM:${mem}% | RSS:${rss}KB"
    else
        echo "NODE_JS | PROCESS_NOT_FOUND"
    fi
}

# Fonction pour obtenir les stats Docker (RabbitMQ, PostgreSQL, Redis)
get_docker_stats() {
    # RabbitMQ
    local rabbitmq_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep rabbitmq 2>/dev/null)
    if [ ! -z "$rabbitmq_stats" ]; then
        echo "RABBITMQ | $rabbitmq_stats"
    else
        echo "RABBITMQ | CONTAINER_NOT_FOUND"
    fi
    
    # PostgreSQL
    local postgres_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep postgres 2>/dev/null)
    if [ ! -z "$postgres_stats" ]; then
        echo "POSTGRES | $postgres_stats"
    else
        echo "POSTGRES | CONTAINER_NOT_FOUND"
    fi
    
    # Redis
    local redis_stats=$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep redis 2>/dev/null)
    if [ ! -z "$redis_stats" ]; then
        echo "REDIS | $redis_stats"
    else
        echo "REDIS | CONTAINER_NOT_FOUND"
    fi
}

# Fonction pour obtenir les stats système
get_system_stats() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    local mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | tr -d ',')
    echo "SYSTEM | CPU:${cpu_usage}% | MEM:${mem_usage}% | LOAD:${load_avg}"
}

# Header du fichier de log
echo "TIMESTAMP | SERVICE | METRICS" > $METRICS_FILE
echo "==========================================" >> $METRICS_FILE

# Monitoring en arrière-plan pendant les tests
monitor_loop() {
    while true; do
        # Collecter les métriques
        log_metrics "$(get_system_stats)"
        log_metrics "$(get_node_stats)"
        log_metrics "$(get_docker_stats)"
        
        # Attendre 2 secondes
        sleep 2
    done
}

# Fonction de nettoyage à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt du monitoring..."
    echo "📊 Rapport de performance sauvegardé: $METRICS_FILE"
    
    # Générer un résumé
    echo ""
    echo "📈 RÉSUMÉ DES PERFORMANCES:"
    echo "=========================="
    echo "Durée du test: $(date)"
    echo "Nombre de mesures: $(wc -l < $METRICS_FILE)"
    
    # Stats Node.js max
    local max_node_cpu=$(grep "NODE_JS" $METRICS_FILE | grep -v "NOT_FOUND" | awk -F'CPU:' '{print $2}' | awk -F'%' '{print $1}' | sort -n | tail -1)
    local max_node_mem=$(grep "NODE_JS" $METRICS_FILE | grep -v "NOT_FOUND" | awk -F'MEM:' '{print $2}' | awk -F'%' '{print $1}' | sort -n | tail -1)
    
    if [ ! -z "$max_node_cpu" ]; then
        echo "Node.js CPU max: ${max_node_cpu}%"
        echo "Node.js MEM max: ${max_node_mem}%"
    fi
    
    # Stats système max
    local max_sys_cpu=$(grep "SYSTEM" $METRICS_FILE | awk -F'CPU:' '{print $2}' | awk -F'%' '{print $1}' | sort -n | tail -1)
    local max_sys_mem=$(grep "SYSTEM" $METRICS_FILE | awk -F'MEM:' '{print $2}' | awk -F'%' '{print $1}' | sort -n | tail -1)
    
    echo "Système CPU max: ${max_sys_cpu}%"
    echo "Système MEM max: ${max_sys_mem}%"
    
    exit 0
}

# Intercepter CTRL+C
trap cleanup INT

# Démarrer le monitoring
echo "📊 Monitoring en cours... (Ctrl+C pour arrêter)"
echo "📁 Logs en temps réel: $METRICS_FILE"
echo ""

# Afficher les métriques en temps réel
monitor_loop &
MONITOR_PID=$!

# Afficher le contenu du fichier en temps réel
tail -f $METRICS_FILE &
TAIL_PID=$!

# Attendre l'interruption
wait 