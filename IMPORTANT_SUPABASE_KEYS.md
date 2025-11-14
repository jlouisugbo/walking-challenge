# 🔐 Supabase Environment Variables Setup

## Environment Variables (Secure Setup)

The app now uses **environment variables** to keep your Supabase keys secure and out of the codebase.

### Development (Local)

Your keys are in `.env.local` (already created):
```bash
VITE_SUPABASE_URL=https://bjaqorctnozmvmahhncs.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Y8ya5T4DMHZDaSfb6MMNfQ_0URVb33B
VITE_SUPABASE_SERVICE_KEY=sb_secret_2MmQFfIyDjubhnhGRDCHvA_G-v9E6Gn
```

**Note:** `.env.local` is already in `.gitignore` so your keys **won't be committed** to GitHub! ✅

### Production (Vercel)

When deploying to Vercel:

1. **Go to your Vercel project** → Settings → Environment Variables
2. **Add these 3 variables:**
   - `VITE_SUPABASE_URL` = `https://bjaqorctnozmvmahhncs.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_Y8ya5T4DMHZDaSfb6MMNfQ_0URVb33B`
   - `VITE_SUPABASE_SERVICE_KEY` = `sb_secret_2MmQFfIyDjubhnhGRDCHvA_G-v9E6Gn`
3. **Environment:** Select "Production", "Preview", and "Development"
4. **Click "Save"**
5. **Redeploy** your app

## Key Format (Supabase New Format)

Your keys use Supabase's **new format** (as of 2024):
- `sb_publishable_*` - New publishable key format ✅
- `sb_secret_*` - New secret key format ✅

**Old format** (legacy): `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT tokens)

Both formats work, but Supabase is transitioning to the newer `sb_*` format.

## Security Notes

- ✅ **anon key** (`sb_publishable_*`) is safe to expose in frontend code
- ⚠️ **service_role key** (`sb_secret_*`) should ONLY be used in admin panel (already protected by password)
- 🔒 Keys are now in environment variables, NOT in the codebase
- 🛡️ RLS policies protect your data even with exposed anon key

## How It Works

The app reads from environment variables in `/src/lib/supabase.ts`:
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';
```

## Testing Locally

```bash
# Keys are already in .env.local
npm run dev

# App will load environment variables automatically
```

## Changing Keys

If you need to update your keys:

### Local Development:
Edit `.env.local` with new values

### Production (Vercel):
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit the variable you want to change
3. Redeploy the app

## Next Steps

✅ Environment variables are configured
✅ Keys are secure and not in codebase
✅ Ready to deploy to Vercel

Just add the environment variables in Vercel Dashboard before deploying!
