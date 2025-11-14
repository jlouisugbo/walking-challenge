# Supabase Migration Guide

## ⚠️ IMPORTANT: Update Supabase URL

Edit `/src/lib/supabase.ts` and replace the placeholder URL with your actual Supabase project URL:

```typescript
const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co'; // UPDATE THIS!
```

## Step 1: Run SQL Schema in Supabase

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the entire SQL schema (see above comprehensive SQL)
4. Click "Run" to execute
5. Verify tables are created

## Step 2: Application Changes Made

### New Files Created:
- `/src/lib/supabase.ts` - Supabase client configuration
- `/src/utils/supabaseStorage.ts` - Database operations
- Toast notifications will be added
- Rules card component will be added
- Weekly 70k milestone components will be added

### Files That Need Updating:
1. **ChallengeContext.tsx** - Switch from localStorage to Supabase
2. **All components** - Use async data loading
3. **Admin panel** - Use supabaseAdmin for writes
4. **Add toast provider** to App.tsx
5. **Add rules card** to Dashboard
6. **Add 70k badges** throughout app
7. **Make cards more compact** globally

## Step 3: Key Changes

### Data Flow:
- **Before**: localStorage → ChallengeContext → Components
- **After**: Supabase → ChallengeContext (async) → Components

### Admin Operations:
- All writes use `supabaseAdmin` (service key)
- Reads use `supabase` (anon key)
- Admin panel still password-protected

### Real-time Updates:
- Data fetched on component mount
- Participants can refresh to see latest
- Admin updates immediately visible

## Step 4: New Features to Add

### 1. Weekly 70k Milestone Badge
- Track steps per week
- Show badge when 70k achieved
- Reset every Monday
- Display on Dashboard and participant cards

### 2. Challenge Rules Card
- Explain all prizes
- Heat Week rules
- Team competition rules
- Wildcard system
- Weekly raffle info
- Show on first visit or via info button

### 3. Toast Notifications
- Show wildcard winner at midnight
- Celebrate 70k achievements
- Admin action confirmations

### 4. Compact Cards
- Reduce padding
- Smaller fonts on mobile
- Optimize for scrolling
- Better information density

## Step 5: Testing Checklist

- [ ] SQL schema executed successfully
- [ ] Supabase URL updated in config
- [ ] Can load participants from database
- [ ] Admin can add new participants
- [ ] Admin can update step counts
- [ ] Daily history saves correctly
- [ ] Wildcard system works
- [ ] Weekly milestones track properly
- [ ] Toast notifications appear
- [ ] Rules card displays correctly
- [ ] Cards are appropriately sized
- [ ] Mobile view optimized

## Step 6: Deployment

1. Build: `npm run build`
2. Deploy to Vercel/Netlify
3. Set environment variables if needed
4. Test in production
5. Share link with participants!

## Multi-User Benefits

✅ Everyone sees the same data
✅ No more exporting/importing
✅ Real-time leaderboard
✅ Admin updates from anywhere
✅ Historical data preserved
✅ Weekly tracking automatic
✅ Wildcard system automated

## Notes

- Admin password (E$horeme11) still required for updates
- Public can view but not edit
- Database automatically backs up via Supabase
- Can export data anytime via Admin panel
- Wildcard calculation still manual for now (can automate with cron job later)
