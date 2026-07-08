# Schema Deployment to Supabase ✓

## Summary
Your application schema has been successfully deployed to Supabase PostgreSQL database!

## What Was Deployed

### 13 Tables Created:
1. **users** - User accounts linked to Supabase auth (9 columns)
2. **organizations** - Company profiles (15 columns)
3. **members** - Organization membership and roles (6 columns)
4. **plans** - Subscription plans (9 columns)
5. **subscriptions** - Active subscriptions (9 columns)
6. **keywords** - Tracked keywords and brand mentions (7 columns)
7. **sources** - Data sources for lead discovery (9 columns)
8. **leads** - Discovered leads with intent scoring (34 columns)
9. **activities** - User and system activity logs (8 columns)
10. **outreach_templates** - Email/message templates (9 columns)
11. **generated_messages** - AI-generated outreach messages (11 columns)
12. **notifications** - User notifications (9 columns)
13. **icp_profiles** - Ideal Customer Profile definitions (16 columns)

### 16 Custom Enum Types Created:
- `user_role` - Admin and user roles
- `org_status` - Active, suspended, deleted
- `member_role` - Owner, admin, member
- `member_status` - Active, invited, removed
- `subscription_status` - Trialing, active, past due, canceled
- `subscription_interval` - Monthly, yearly
- `keyword_type` - Keyword, competitor, brand
- `source_type` - Keyword, competitor, brand, account, subreddit
- `intent_type` - 7 intent types for lead scoring
- `sentiment` - 8 sentiment classifications
- `lead_status` - New, qualified, contacted, responded, converted, archived
- `activity_type` - 6 activity types
- `template_type` - Cold email, LinkedIn, Twitter, call script, follow-up
- `message_type` - Same as template type
- `message_status` - Draft, sent, failed
- `notification_type` - Hot lead, competitor mention, funding alert, etc.

## Database Configuration

**Host:** db.ycfvpzlszzyaumepocvg.supabase.co  
**Port:** 5432  
**Database:** postgres  
**User:** postgres  
**Connection String:** Stored in `.env` as `DATABASE_URL`

## Key Features

✓ **UUID Support** - Users table includes `supabase_id` (UUID) field for linking to Supabase auth  
✓ **JSON Columns** - Flexible data storage for keywords, competitors, technologies, etc.  
✓ **Timestamps** - All tables include `created_at` and `updated_at` fields  
✓ **Enums** - Type-safe enum fields with predefined values  
✓ **Relationships** - Foreign key ready structure (add constraints as needed)  
✓ **Indexes** - Unique constraints on key fields (email, slug, organization_id, etc.)

## Next Steps

1. **Enable Row Level Security (RLS)** in Supabase:
   ```sql
   -- Example: Enable users to read their own data
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = supabase_id);
   ```

2. **Create Foreign Keys** (if you want enforced relationships):
   ```sql
   ALTER TABLE members ADD CONSTRAINT members_org_fk 
     FOREIGN KEY (organization_id) REFERENCES organizations(id);
   ALTER TABLE members ADD CONSTRAINT members_user_fk 
     FOREIGN KEY (user_id) REFERENCES users(id);
   ```

3. **Set Up Backups** - Supabase automatically backs up your data

4. **Test the Application:**
   - Start the dev server: `npm run dev`
   - Try creating a user account
   - Verify data is stored correctly

## Migration Files

The schema migrations are stored in:
- `db/migrations/0000_yummy_marvex.sql` - Main table creation
- `db/migrations/0001_create_enums.sql` - Enum type creation
- `db/migrations/meta/` - Drizzle ORM metadata

## Rollback Instructions

If you need to rollback (drop all tables):

```sql
-- WARNING: This will delete all data!
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS generated_messages CASCADE;
DROP TABLE IF EXISTS icp_profiles CASCADE;
DROP TABLE IF EXISTS keywords CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS outreach_templates CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS activity_type CASCADE;
DROP TYPE IF EXISTS intent_type CASCADE;
DROP TYPE IF EXISTS keyword_type CASCADE;
DROP TYPE IF EXISTS lead_status CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS message_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS org_status CASCADE;
DROP TYPE IF EXISTS sentiment CASCADE;
DROP TYPE IF EXISTS source_type CASCADE;
DROP TYPE IF EXISTS subscription_interval CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS template_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
```

## PostgreSQL vs MySQL Changes

This app was migrated from MySQL to PostgreSQL:
- Changed from `drizzle-orm/mysql2` to `drizzle-orm/postgres-js`
- Updated `drizzle.config.ts` dialect to `postgresql`
- Updated database connection in `api/queries/connection.ts`
- Replaced `mysql2` dependency with `postgres`
- Enum syntax changed from MySQL `ENUM` to PostgreSQL's `CREATE TYPE`

## Support

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
