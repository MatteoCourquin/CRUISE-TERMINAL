# Rotterdam Ship Radar

MVP mobile-first. Une seule question :

**Quels paquebots arrivent ou quittent Holland Amerikakade (Cruise Terminal Rotterdam) dans les prochaines minutes ou heures ?**

Le point d'intérêt n'est **pas** le trafic général devant l'Erasmusbrug. C'est le quai croisière :

- adresse : Wilhelminakade 699, Rotterdam ([Cruise Port Rotterdam](https://www.cruiseportrotterdam.nl/cruise-terminal-en/), [Holland America Line](https://www.hollandamerica.com/nl/nl/cruise-destinations/europe-cruises/europe-departure-ports/cruises-from-rotterdam))
- quai : Holland Amerikakade
- coords : `51.9065, 4.486`

L'Erasmusbrug reste un repère sur la carte uniquement.

## État actuel

L'interface fonctionne en mode mock : carte centrée sur Holland Amerikakade, détection arrivée / à quai / départ, ETA, tri, filtres et bouton Y aller.

AISStream n'est pas encore connecté. Le serveur local démarre et signale `offline` tant que le branchement live n'est pas fait.

## Installation

```bash
npm install
cp .env.example .env
```

Deux processus, selon le mode :

```bash
npm run dev
```

Interface Next.js sur [http://localhost:3000](http://localhost:3000).

```bash
npm run dev:server
```

Serveur temps réel sur `ws://localhost:3001`. Inutile tant que `NEXT_PUBLIC_USE_MOCK_AIS=true`.

Vérifier les types :

```bash
npm run typecheck
```

## Variables d'environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | navigateur | Maps JavaScript API |
| `NEXT_PUBLIC_GOOGLE_MAP_ID` | navigateur | Map ID requis par les Advanced Markers |
| `NEXT_PUBLIC_USE_MOCK_AIS` | navigateur | `true` : bateaux fictifs, sans AISStream |
| `NEXT_PUBLIC_AIS_SERVER_URL` | navigateur | WebSocket du serveur local, défaut `ws://localhost:3001` |
| `AISSTREAM_API_KEY` | serveur seulement | clé AISStream |
| `AIS_SERVER_PORT` | serveur seulement | port du serveur local, défaut `3001` |

`AISSTREAM_API_KEY` ne doit jamais être préfixée par `NEXT_PUBLIC_`. Elle n'est lue que dans `/server`.

## Google Maps

1. Créer un projet dans Google Cloud.
2. Activer **Maps JavaScript API**.
3. Créer une clé API.
4. Créer un **Map ID** (carte vectorielle). Les Advanced Markers l'exigent.
5. Restreindre la clé : référents HTTP pour le site, et uniquement Maps JavaScript API.

Renseigner ensuite :

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAP_ID=
```

La carte elle-même est ajoutée au STEP 2, avec `@vis.gl/react-google-maps`.

## AISStream

Créer une clé sur [aisstream.io](https://aisstream.io/), puis :

```env
AISSTREAM_API_KEY=
```

Le serveur s'abonnera plus tard à `wss://stream.aisstream.io/v0/stream`, uniquement sur la bounding box définie dans `lib/config.ts` (Rotterdam, Nieuwe Maas, Schiedam, environ 15 km à l'ouest et à l'est).

## Mock mode

```env
NEXT_PUBLIC_USE_MOCK_AIS=true
```

Affiche des paquebots **fictifs** (Eurodam, Nieuw Statendam…) pour développer l'UI sans AISStream. Ce n'est **pas** le quai réel.

Pour les données réelles :

```env
NEXT_PUBLIC_USE_MOCK_AIS=false
NEXT_PUBLIC_AIS_SERVER_URL=ws://localhost:3001
AIS_SERVER_PORT=3001
AISSTREAM_API_KEY=...
```

Puis lance **deux** terminaux :

```bash
npm run dev
npm run dev:server
```

Si le quai est vide sur la webcam, l'app doit aussi être vide côté live (LIVE + « Aucun paquebot au quai »). C'est le comportement attendu.

## Prochaines escales

La section **Prochaines escales** lit le planning public de [Cruise Port Rotterdam](https://www.cruiseportrotterdam.nl/cruise-calls/) (Cruise Terminal / Holland Amerikakade).

Ce n'est **pas** limité à Holland America Line : AIDA, MSC, Princess, Cunard, etc. y apparaissent aussi, car ce sont les escales du même quai.

Endpoint interne : `GET /api/cruise-calls` (scraping HTML côté serveur, cache ~1 h).

## Architecture

Next.js sur Vercel ne garde pas une connexion WebSocket sortante vivante. Une fonction serverless démarre pour une requête, puis s'arrête. AISStream a besoin d'un processus qui reste connecté. Un singleton dans une route Next.js casserait au rechargement, se dupliquerait entre instances, et exposerait mal la clé. Il n'y a donc pas de relais dans l'App Router.

```txt
AISStream
↓
/server          processus Node + ws, clé API uniquement ici
↓
normalisation    un état par MMSI
↓
trajectoire      distance, cap, approche, ETA
↓
WebSocket local  uniquement les bateaux filtrés + le statut de connexion
↓
Next.js          Google Map + liste d'arrivées
```

En mode mock, le navigateur simule les bateaux et réutilise la même logique dans `/lib`. Il ne contacte pas AISStream.

```txt
/app            routes Next.js
/components     Map, ShipMarker, ShipCard, ShipList, Filters, LiveStatus, GoToBridgeButton
/lib/config.ts  Holland Amerikakade, seuils, bounding box
/lib/geo        calculs géographiques
/lib/ais        normalisation AIS et mock
/lib/vessels    fusion des messages et suppression des pistes périmées
/types          Vessel et messages du serveur
/server         client AISStream et WebSocket vers le navigateur
```

Le point d'intérêt et les seuils sont dans `lib/config.ts` :

```ts
HOLLAND_AMERIKAKADE = { lat: 51.9065, lng: 4.486 }
SETTINGS.detectionRadiusKm = 20
SETTINGS.maxEtaMinutes = 180
SETTINGS.minimumSpeedKnots = 1
SETTINGS.maxTrajectoryDistanceMeters = 250
SETTINGS.atQuayRadiusMeters = 200
SETTINGS.departureRadiusKm = 10
```

## Known limitations

- L'AIS ne dit pas « ce navire est un paquebot de croisière ». On combine type Passenger, longueur ≥ 180 m, exclusion des ferries (Stena, DFDS…), et une liste de noms croisière connus quand la longueur n'est pas encore reçue.
- Les **prochaines escales** viennent d'un scrape HTML de cruiseportrotterdam.nl. Si le site change sa structure, le parseur peut casser. Les horaires sont sous réserve et ne remplacent pas l'AIS.
- Un paquebot qui passe devant Wilhelminapier sans y accoster peut être mal classé.
- Un départ n'est suivi que tant que le navire reste dans `departureRadiusKm` et s'éloigne du quai.
- Les messages AIS arrivent séparément. Le nom ou le type peut manquer tant que le message statique n'est pas passé.
- La fréquence de mise à jour est irrégulière. Un bateau peut sembler figé, puis sauter.
- L'ETA est `distance / vitesse`. Ce n'est pas une heure maritime officielle, ni l'horaire HAL publié.
- La trajectoire s'appuie sur le Course Over Ground du dernier message. Un bateau peut changer de route avant le quai.
- L'état des bateaux vit en mémoire. Redémarrer `/server` oublie les pistes en cours.
- Le frontend peut être déployé sur Vercel. Le processus `/server` ne peut pas : il lui faut un hébergement qui reste allumé (VPS, Railway, Fly.io, ou équivalent).
- Le mode mock ne reflète pas les trous ni le rythme réel des messages AIS.
