# Tourism Reservation System

Un système de réservation de tourisme basé sur une architecture microservices, permettant la gestion des hôtels, vols, guides touristiques et restaurants.

## 📋 Architecture

Le projet est composé des services suivants:

- **API Gateway**: Point d'entrée unique pour toutes les requêtes (Spring Boot)
- **Auth Service**: Service d'authentification et d'autorisation (Spring Boot)
- **Backend (Hotel Service)**: Service de gestion des hôtels et réservations (Spring Boot)
- **Flight Service**: Service de gestion des vols (Spring Boot)
- **Guide Service**: Service de gestion des guides touristiques (Spring Boot)
- **Restaurant Service**: Service de gestion des restaurants (Spring Boot)
- **Tourism App**: Application frontend (React)

## 🚀 Démarrage rapide

### Prérequis

- Docker & Docker Compose
- Java 11+ (pour le développement local)
- Node.js 14+ (pour le frontend)
- Maven 3.6+

### Installation avec Docker

```bash
# À partir du répertoire racine du projet
docker-compose up -d
```

Les services seront disponibles sur:
- API Gateway: `http://localhost:8080`
- Tourism App: `http://localhost:3000`

### Installation locale

1. **Cloner le projet**
```bash
cd mesmoudi
```

2. **Démarrer les services backend**
```powershell
# Sur Windows, exécuter
./run_project.ps1
```

3. **Démarrer le frontend**
```bash
cd tourism-app/tourism-app
npm install
npm start
```

## 📁 Structure du projet

```
mesmoudi/
├── API-Gateway/          # Service passerelle API
├── auth-service/         # Service d'authentification
├── backend/              # Service de réservation hôtel
├── flightservice/        # Service de gestion des vols
├── guide_service/        # Service de gestion des guides
├── restaurant-service/   # Service de gestion des restaurants
├── tourism-app/          # Application frontend React
├── docker-compose.yml    # Configuration Docker Compose
├── run_project.ps1       # Script de démarrage (Windows)
└── create_*_db.sql       # Scripts de création des bases de données
```

## 🛠️ Configuration des bases de données

Les scripts SQL pour initialiser les bases de données:

- `create_db.sql` - Base de données principale
- `create_flight_db.sql` - Base de données des vols
- `create_guide_db.sql` - Base de données des guides
- `create_hotel_db.sql` - Base de données des hôtels
- `create_restaurant_db.sql` - Base de données des restaurants

## 📝 Commandes utiles

### Maven (Services backend)

```bash
# Compiler
mvn clean install

# Tester
mvn test

# Build Docker
mvn clean package docker:build
```

### Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Arrêter tous les services
docker-compose down

# Voir les logs
docker-compose logs -f [service-name]
```

## 🔐 Authentification

Le système utilise un service d'authentification centralisé (`auth-service`). Toutes les requêtes doivent inclure un token JWT dans le header `Authorization`.

## 📚 Documentation supplémentaire

Consultez les fichiers `HELP.md` dans chaque répertoire de service pour plus de détails spécifiques.

## 🐛 Troubleshooting

### Ports déjà utilisés
Si les ports par défaut sont utilisés, vérifiez les ports configurés dans `docker-compose.yml` et les fichiers `application.properties`.

### Erreurs de connexion à la base de données
Vérifiez que:
- Les services de base de données sont en cours d'exécution
- Les credentials dans les fichiers de configuration correspondent
- La base de données a bien été initialisée avec les scripts SQL

## 📞 Support

Pour toute question ou problème, veuillez consulter la documentation de chaque service ou contacter l'équipe de développement.

---

**Dernière mise à jour**: Décembre 2025
