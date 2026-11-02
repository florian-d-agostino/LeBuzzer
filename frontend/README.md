# LeBuzzer - Frontend

React 18 + TypeScript strict + Vite. Écran animateur et écran joueur, temps réel via STOMP sur SockJS.



## Lancement

Prérequis : Node 18+ et le backend lancé sur `http://localhost:8080`.

```bash
cd frontend
npm install
npm run dev
```

Ouvrir `http://localhost:5173`. Pour pointer vers un autre backend, copier `.env.example` en `.env` et modifier `VITE_API_URL`.

Autres scripts : `npm run build` (typecheck strict + build), `npm run typecheck`.



## Architecture

Même découpage en couches que le backend :

```
src/
├── config/        URLs backend, topics, constantes de backoff
├── model/         GameStatus, ConnectionStatus, GameEventType, Session, RoomState
├── dto/
│   ├── request/   miroir des DTO request Java
│   └── response/  miroir des DTO response Java + GameEventDto typé
├── services/      RoomApiService (REST), SocketService (STOMP), SessionService (storage), roomReducer
├── hooks/         useSocket (cycle de vie connexion), useRoom (état de partie), useCountdown
├── components/    composants UI réutilisables
└── pages/         HomePage, HostPage, PlayerPage
```

- **Aucune logique de connexion dans les composants** : tout passe par `SocketService` + `useSocket` / `useRoom`.
- **Désabonnement au démontage** : chaque `useEffect` retourne sa fonction de nettoyage (unsubscribe du topic, déconnexion du client, arrêt des timers). Sans ça, un composant démonté continue de recevoir des messages et d'appeler `setState`, les abonnements s'accumulent à chaque montage (messages traités en double) et la socket reste ouverte.



## Les 4 difficultés

1. **Joueur en retard** : à chaque connexion, on s'abonne au topic *puis* on récupère le snapshot `GET /api/rooms/{code}/state` (question en cours, temps restant, joueurs/scores). Les événements suivants s'appliquent ensuite sur cet état via `roomReducer`.
2. **Reconnexion** : `SocketService` détecte la fermeture de la socket (et les événements `offline`/`online` du navigateur), affiche l'état (`Connecté` / `Reconnexion…` / `Déconnecté`) et retente avec un backoff exponentiel (1s, 2s, 4s… plafonné à 30s, avec jitter). À la reconnexion : réabonnement, message `reconnect` côté joueur, et rechargement du snapshot.
3. **Autorité sur le temps** : le serveur. Il enregistre `questionStartedAt` et calcule `remainingSeconds` dans le snapshot ; le navigateur ne fait qu'afficher un décompte à partir de cette valeur. Un joueur qui recharge ou se reconnecte retombe sur le temps serveur. La fermeture de la question est déclenchée par l'écran animateur à 0s (ou quand tous les joueurs connectés ont répondu).
4. **Cas limites** : un joueur ne peut valider qu'une fois (UI verrouillée + réponse mémorisée dans `sessionStorage`, et le serveur ignore les doublons) ; chaque partie a son propre topic `/topic/room/{code}`.



## Instrumentation

`SocketService.stats` compte les messages STOMP envoyés et reçus. Les compteurs sont visibles au survol du badge de connexion (utile pour la note comparative polling / WebSocket).
