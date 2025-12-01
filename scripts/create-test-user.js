/**
 * Script to create a test user for authentication testing
 * 
 * Usage:
 * 1. Make sure you have your Supabase credentials in .env.local
 * 2. Run: node scripts/create-test-user.js
 * 
 * This will create a test user with:
 * - Email: test@example.com
 * - Password: testpassword123
 * - Name: Test User
 */

// Try to load dotenv if available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not installed, will use process.env directly
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  const testEmail = 'test@example.com';
  const testPassword = 'testpassword123';
  const testName = 'Test User';

  console.log('🔐 Creating test user...');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Name: ${testName}\n`);

  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);

    if (existingUser) {
      console.log('⚠️  User already exists!');
      console.log(`   User ID: ${existingUser.id}`);
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Created: ${existingUser.created_at}\n`);
      console.log('✅ You can now sign in with:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}\n`);
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: testName,
        name: testName,
      },
    });

    if (error) {
      throw error;
    }

    console.log('✅ Test user created successfully!');
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Email: ${data.user.email}`);
    console.log(`   Name: ${data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'N/A'}\n`);
    console.log('📝 You can now sign in with:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}\n`);
    console.log('🌐 Sign in at: http://localhost:3000/auth/login\n');
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    
    if (error.message.includes('Service role')) {
      console.error('\n💡 Tip: To use this script, you need a service role key.');
      console.error('   Get it from: Supabase Dashboard > Settings > API > service_role key');
      console.error('   Add it to .env.local as: SUPABASE_SERVICE_ROLE_KEY=your-key-here\n');
      console.error('   Alternatively, you can create a user manually:');
      console.error('   1. Go to http://localhost:3000/auth/signup');
      console.error('   2. Sign up with email and password');
      console.error('   3. Check your email for confirmation (if required)\n');
    }
    
    process.exit(1);
  }
}

createTestUser();

