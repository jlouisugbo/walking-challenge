# ⚠️ IMPORTANT: Supabase API Keys Issue

## Current Keys (Provided by User)
The keys you provided don't match the standard Supabase JWT token format:
- Publishable: `sb_publishable_Y8ya5T4DMHZDaSfb6MMNfQ_0URVb33B`
- Secret: `sb_secret_2MmQFfIyDjubhnhGRDCHvA_G-v9E6Gn`

## Standard Supabase Keys Look Like This
```
anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYXFvcmN0bm96bXZtYWhobmNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1NTgzNzgsImV4cCI6MjA0NzEzNDM3OH0...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqYXFvcmN0bm96bXZtYWhobmNzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMTU1ODM3OCwiZXhwIjoyMDQ3MTM0Mzc4fQ...
```

## How to Get the Correct Keys

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `bjaqorctnozmvmahhncs`
3. Click **Settings** (gear icon in sidebar)
4. Click **API** under Project Settings
5. You'll see two keys:
   - **anon public** - Use this for `SUPABASE_ANON_KEY`
   - **service_role** - Use this for `SUPABASE_SERVICE_KEY` (**Keep this secret!**)

## Update the Keys

Once you have the correct keys, update `/src/lib/supabase.ts`:

```typescript
const SUPABASE_URL = 'https://bjaqorctnozmvmahhncs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJ...'; // Replace with your anon key
const SUPABASE_SERVICE_KEY = 'eyJ...'; // Replace with your service_role key
```

## Security Notes
- ✅ **anon key** is safe to expose in frontend code
- ⚠️ **service_role key** should ONLY be used in admin panel (already protected by password)
- 🔒 Never commit service_role key to public repositories
- 🛡️ RLS policies protect your data even with exposed anon key

## Next Steps
1. Get the correct keys from Supabase dashboard
2. Update `/src/lib/supabase.ts`
3. Run the SQL setup script (`SUPABASE_SETUP.sql`)
4. Test the application

I'll continue building the features with the current setup, but **you'll need to update the keys** before the database connection will work!
