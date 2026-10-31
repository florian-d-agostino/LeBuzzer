# Coding Style & Architecture Guidelines - LeBuzzer

## Style & Forme
- **Espacements généreux** : Toujours laisser 2 à 3 lignes vides entre les déclarations, les méthodes et les blocs majeurs pour une aération maximale.
- **Commentaires courts et concis** : Commentaires télégraphiques de 2 à 4 mots maximum (ex: `// Find Room`, `// Check Host`, `// Save room`).
- **Nommage** : En anglais strict, camelCase pour les méthodes et variables, PascalCase pour les classes.

## Architecture & SOLID
- **S (Single Responsibility)** : Une classe = un seul rôle (Config pour le transport, Controller pour router, Service pour le métier).
- **O (Open/Closed)** : Architecture extensible par topics dynamiques sans modifier le code existant.
- **L (Liskov Substitution)** : Interfaces et contrats respectés.
- **I (Interface Segregation)** : DTOs minimaux et ciblés, pas de surcharge.
- **D (Dependency Inversion)** : Injection par constructeur (`@RequiredArgsConstructor`) via des abstractions.
- **Méthodes helper DRY** : Helpers réutilisables en tête de classe.
- **Sécurité & Concurrence** :
  - Pas de fuite de tokens privés (`hostToken`, tokens secrets des joueurs).
  - Utilisation de structures thread-safe (`ConcurrentHashMap`, `CopyOnWriteArrayList`, `Set`).
  - Validation serveur stricte (un joueur ne peut soumettre qu'une réponse par question).
