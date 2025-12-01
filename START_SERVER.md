# Starting Your Development Server

## Quick Start

To start your local development server, run:

```bash
npm run dev
```

The server should start on `http://localhost:3000`

## Troubleshooting

### If the server won't start:

1. **Check if port 3000 is already in use:**
   ```bash
   lsof -ti:3000
   ```
   If this returns a process ID, kill it:
   ```bash
   kill -9 $(lsof -ti:3000)
   ```

2. **Check environment variables:**
   Make sure your `.env.local` file exists and has the required variables:
   ```bash
   cat .env.local
   ```
   
   It should contain:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Reinstall dependencies (if needed):**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check for TypeScript errors:**
   ```bash
   npm run type-check
   ```

5. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be Node.js 18+ for Next.js 14

## Common Issues

### Error: "Missing Supabase environment variables"
- Make sure `.env.local` file exists in the root directory
- Check that the variables are correctly named (no typos)
- Restart the dev server after adding/changing env variables

### Error: "Port 3000 already in use"
- Another process is using port 3000
- Use the commands above to find and kill the process
- Or specify a different port: `PORT=3001 npm run dev`

### Server starts but shows errors
- Check the terminal output for specific error messages
- Common issues: missing env vars, database connection issues, or TypeScript errors

