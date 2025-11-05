# Migrations Supabase

## Comment appliquer les migrations

### Option 1 : Via le Dashboard Supabase (Recommandé)
1. Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans "SQL Editor"
4. Copiez le contenu du fichier SQL de migration
5. Collez-le et exécutez la requête

### Option 2 : Via la CLI Supabase (Si configurée)
```bash
supabase db push
```

## Migrations disponibles

- `20241014_add_aides_financieres.sql` - Ajoute la colonne `aides_financieres` à la table `form-responses` pour stocker les aides financières (Pôle emploi, UpCo, etc.)
- `20241023_add_ask_contact.sql` - Ajoute la colonne `ask_contact` (boolean) à la table `form-responses` pour indiquer si l'utilisateur souhaite être recontacté
