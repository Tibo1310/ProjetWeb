<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Chat Application Backend

## Description
Backend pour une application de messagerie instantanée utilisant NestJS, GraphQL et RabbitMQ.

## Technologies
- NestJS
- GraphQL (Apollo Server)
- RabbitMQ
- Redis (Cache)
- Docker & Docker Compose
- TypeScript

## Prérequis
- Node.js (v20.x)
- Docker & Docker Compose
- npm ou yarn

## Installation

1. Cloner le projet
```bash
git clone <repository-url>
cd backend
```

2. Copier le fichier d'environnement
```bash
cp .env.example .env
```

3. Installer les dépendances
```bash
npm install
```

4. Lancer les services avec Docker Compose
```bash
docker-compose up -d
```

## Développement

```bash
# Lancer en mode développement
npm run start:dev

# Lancer les tests unitaires
npm run test

# Lancer les tests e2e
npm run test:e2e

# Lancer les tests d'intégration
npm run test:integration

# Lancer les tests de performance
npm run test:load
```

## API GraphQL

L'API GraphQL est accessible à l'adresse : http://localhost:3000/graphql

### Principales fonctionnalités
- Création de profil utilisateur
- Liste des utilisateurs
- Liste des conversations
- Détails des conversations
- Envoi de messages en temps réel

## Tests de performance
Les tests de performance sont configurés avec Artillery. Pour exécuter les tests :
```bash
npm run test:load
```

## Documentation
La documentation de l'API est auto-générée grâce à GraphQL Playground.

## Architecture
- `src/users/` : Gestion des utilisateurs
- `src/conversations/` : Gestion des conversations
- `src/rabbitmq/` : Configuration RabbitMQ
- `src/cache/` : Configuration du cache Redis
- `src/graphql/` : Configuration GraphQL

## Variables d'environnement
- `PORT` : Port du serveur (défaut: 3000)
- `RABBITMQ_URL` : URL de connexion RabbitMQ
- `REDIS_HOST` : Hôte Redis
- `REDIS_PORT` : Port Redis

## Project setup

```bash
$ npm install
```