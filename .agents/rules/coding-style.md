# Coding Style & Architecture Guidelines - LeBuzzer

## Style & Forme
- **Espacements généreux** : Toujours laisser 2 à 3 lignes vides entre les déclarations, les méthodes et les blocs majeurs pour une aération maximale.
- **Commentaires courts et concis** : Commentaires télégraphiques de 2 à 4 mots maximum (ex: `// Find Room`, `// Check Host`, `// Save room`).
- **Nommage** : En anglais strict, camelCase pour les méthodes et variables, PascalCase pour les classes.

## Architecture
- **Méthodes helper DRY** : Placer les helpers réutilisables (`getRoomOrThrow`, `getPlayerOrThrow`) en haut de classe pour factoriser la recherche et la validation d'entités.
- **Sécurité & Concurrence** :
  - Pas de fuite de tokens privés (`hostToken`, tokens secrets des joueurs).
  - Utilisation de structures thread-safe (`ConcurrentHashMap`, `CopyOnWriteArrayList`, `Set`).
  - Validation serveur stricte (un joueur ne peut soumettre qu'une réponse par question).
