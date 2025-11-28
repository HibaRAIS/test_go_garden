# 🌱 Co-Garden - Données de Test

Ce document fournit des exemples de données pour tester l'application et l'architecture mesh.

## 1. Créer des Utilisateurs

### Via Frontend
1. Allez sur http://localhost:5173/register
2. Créez 3-4 utilisateurs :
   - Jean Dupont (jean@example.com)
   - Marie Martin (marie@example.com)
   - Pierre Durand (pierre@example.com)

### Via Swagger (Service Membres)
http://localhost:3001/api-docs

```json
POST /auth/register
{
  "name": "Alice Bernard",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Notez les IDs des utilisateurs créés** (retournés dans la réponse).

---

## 2. Créer des Parcelles

### Via Swagger (Service Parcelles)
http://localhost:3002/api-docs

Remplacez `<USER_ID>` par un ID utilisateur réel, et `<PLANT_ID>` par un ID de plante (voir section 3).

```json
POST /api/plots
{
  "name": "Parcelle Nord",
  "location_ref": "Zone A, Rangée 1",
  "size_sqm": 25,
  "member_id": "<USER_ID>",
  "current_plant_id": "<PLANT_ID>"
}
```

Exemples supplémentaires :
```json
{
  "name": "Parcelle Est",
  "location_ref": "Zone B, Rangée 3",
  "size_sqm": 30,
  "member_id": "<USER_ID>",
  "current_plant_id": null
}
```

**Notez les IDs des parcelles créées**.

---

## 3. Récupérer les Plantes (Déjà Seedées)

Le Service Catalogue seed automatiquement 5 plantes au démarrage :
- Tomate
- Basilic
- Carotte
- Laitue
- Courgette

### Via Swagger (Service Catalogue)
http://localhost:3004/api-docs

```
GET /api/plants
```

**Notez les IDs des plantes** pour les utiliser dans les parcelles et tâches.

---

## 4. Créer des Tâches

### Via Swagger (Service Tâches)
http://localhost:3003/api-docs

Remplacez les IDs par des valeurs réelles.

```json
POST /api/tasks
{
  "title": "Arrosage des tomates",
  "description": "Arroser abondamment le matin, éviter les feuilles",
  "due_date": "2024-02-15T09:00:00.000Z",
  "plot_id": "<PLOT_ID>",
  "plant_id": "<PLANT_ID>",
  "assigned_to": ["<USER_ID_1>", "<USER_ID_2>"]
}
```

Autres exemples :
```json
{
  "title": "Désherbage parcelle Nord",
  "description": "Retirer les mauvaises herbes autour des plants",
  "due_date": "2024-02-10T10:00:00.000Z",
  "plot_id": "<PLOT_ID>",
  "assigned_to": ["<USER_ID>"]
}
```

```json
{
  "title": "Récolte des carottes",
  "description": "Vérifier la maturité et récolter si prêt",
  "plant_id": "<PLANT_ID>",
  "assigned_to": ["<USER_ID_1>", "<USER_ID_2>", "<USER_ID_3>"]
}
```

---

## 5. Ajouter des Commentaires sur les Plantes

### Via Swagger (Service Catalogue)
http://localhost:3004/api-docs

```json
POST /api/plants/{plant_id}/comments
{
  "text": "Excellente variété ! Très productive cette année.",
  "author_id": "<USER_ID>"
}
```

Autres exemples :
```json
{
  "text": "Attention aux pucerons en été, utiliser du savon noir.",
  "author_id": "<USER_ID>"
}
```

```json
{
  "text": "Parfait en association avec le basilic, repousse les insectes.",
  "author_id": "<USER_ID>"
}
```

---

## 6. Tester les Endpoints Mesh

Une fois les données créées, testez les endpoints mesh qui agrègent les données des services.

### A. Dashboard Utilisateur (Service Membres)

```
GET /api/profile/dashboard/{member_id}
```

**Remplacez** `{member_id}` par un ID utilisateur réel.

**Résultat attendu** :
```json
{
  "user": { ... },
  "plots": [ ... ],          // Parcelles du membre
  "tasks": [ ... ],          // Tâches assignées au membre
  "comments": [ ... ],       // Commentaires du membre
  "_metadata": {
    "plots_count": 2,
    "tasks_count": 3,
    "comments_count": 1
  }
}
```

---

### B. Détails Parcelle (Service Parcelles)

```
GET /api/plots/{plot_id}/details
```

**Résultat attendu** :
```json
{
  "plot": { ... },
  "owner": { ... },          // Depuis Service Membres
  "tasks": [ ... ],          // Depuis Service Tâches
  "plant_info": { ... },     // Depuis Service Catalogue
  "_metadata": {
    "tasks_count": 2
  }
}
```

---

### C. Contexte Tâche (Service Tâches)

```
GET /api/tasks/{task_id}/context
```

**Résultat attendu** :
```json
{
  "task": { ... },
  "assignees": [ ... ],      // Depuis Service Membres
  "plot": { ... },           // Depuis Service Parcelles
  "plant": { ... },          // Depuis Service Catalogue
  "_metadata": {
    "assignees_count": 2
  }
}
```

---

### D. Rapport Plante (Service Catalogue)

```
GET /api/plants/{plant_id}/report
```

**Résultat attendu** :
```json
{
  "plant": { ... },
  "comments": [              // Avec noms des auteurs depuis Service Membres
    {
      "text": "...",
      "author_name": "Jean Dupont",
      ...
    }
  ],
  "plots_cultivating": [ ... ], // Depuis Service Parcelles
  "related_tasks": [ ... ],     // Depuis Service Tâches
  "_metadata": {
    "comments_count": 3,
    "plots_count": 2,
    "tasks_count": 4
  }
}
```

---

## 7. Tester via le Frontend

### A. Se Connecter
1. Allez sur http://localhost:5173/login
2. Connectez-vous avec un compte créé

### B. Dashboard
- Vous verrez vos parcelles, tâches et commentaires agrégés
- Les stats s'affichent en haut

### C. Parcelles
- Cliquez sur "Parcelles" dans la navbar
- Cliquez sur une parcelle pour voir ses détails (endpoint mesh)

### D. Catalogue
- Cliquez sur "Catalogue"
- Cliquez sur une plante pour voir son rapport complet (endpoint mesh)

### E. Tâches
- Cliquez sur "Tâches"
- Vous verrez toutes les tâches

---

## Script de Test Complet (Exemple)

Voici un workflow complet pour tester l'architecture :

1. **Créer 3 utilisateurs** via /register
   - Jean (jean@example.com)
   - Marie (marie@example.com)
   - Pierre (pierre@example.com)

2. **Récupérer les IDs des plantes** via `GET /api/plants`
   - Tomate : `plant_id_1`
   - Basilic : `plant_id_2`

3. **Créer 2 parcelles** (Jean)
   - Parcelle Nord (Tomates)
   - Parcelle Sud (Basilic)

4. **Créer 2 tâches**
   - "Arrosage" assignée à Jean et Marie
   - "Récolte" assignée à Pierre

5. **Ajouter 2 commentaires** sur la Tomate
   - Commentaire de Marie
   - Commentaire de Pierre

6. **Tester les endpoints mesh** :
   - Dashboard de Jean → voir ses 2 parcelles, 1 tâche
   - Détails Parcelle Nord → voir Jean (owner), tâche arrosage, plante Tomate
   - Rapport Tomate → voir 2 commentaires avec noms, 1 parcelle, 1 tâche

---

## Notes Importantes

- **Tous les IDs sont des UUIDs** (format : `550e8400-e29b-41d4-a716-446655440000`)
- **Les dates doivent être au format ISO 8601** : `2024-02-15T09:00:00.000Z`
- **Le token JWT expire après 7 jours** (configurable dans `.env`)
- **Les services gèrent gracieusement les erreurs** : si un service est down, les autres données s'affichent quand même

---

## Troubleshooting

### "Service non disponible"
- Vérifiez que tous les services sont démarrés (`npm run dev`)
- Vérifiez les logs dans le terminal

### "Membre non trouvé"
- Utilisez des IDs valides (copiez-collez depuis les réponses Swagger)

### "Token invalide"
- Reconnectez-vous pour obtenir un nouveau token
- Vérifiez que le token est bien envoyé dans le header Authorization

---

Bon test ! 🌱
