# 🚀 Deployment Guide for bluelicht.com

## Pre-Deployment Checklist

### ✅ Environment Variables
Create a `.env.production` file with your production values:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Next.js Configuration
NEXTAUTH_URL=https://bluelicht.com
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### ✅ Domain Configuration
- Ensure bluelicht.com is ready for DNS configuration
- Have access to your domain registrar's DNS settings

## Deployment Options

### Option 1: Vercel (Recommended)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Login to Vercel
```bash
vercel login
```

#### Step 3: Deploy
```bash
vercel --prod
```

#### Step 4: Configure Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all your production environment variables

#### Step 5: Configure Custom Domain
1. Go to Settings > Domains
2. Add `bluelicht.com`
3. Follow DNS configuration instructions

### Option 2: Netlify

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Deploy
```bash
netlify deploy --prod
```

### Option 3: Railway

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Deploy
```bash
railway login
railway init
railway up
```

## Post-Deployment Steps

### 1. Test Your Application
- [ ] Homepage loads correctly
- [ ] Pricing section displays with live-FX
- [ ] Calculator functionality works
- [ ] Email collection works
- [ ] API endpoints respond correctly

### 2. Configure DNS
Point your domain to your deployment platform:

**For Vercel:**
```
Type: A
Name: @
Value: 76.76.19.19
```

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5
```

### 3. SSL Certificate
Most platforms provide automatic SSL. Verify HTTPS is working.

### 4. Performance Optimization
- [ ] Enable image optimization
- [ ] Configure caching headers
- [ ] Set up CDN if needed

## Monitoring & Analytics

### 1. Set up monitoring
- Vercel Analytics (if using Vercel)
- Google Analytics
- Error tracking (Sentry)

### 2. Performance monitoring
- Core Web Vitals
- API response times
- Error rates

## Troubleshooting

### Common Issues:
1. **Environment variables not loading**: Check platform-specific configuration
2. **API errors**: Verify all API keys are set correctly
3. **Domain not resolving**: Check DNS propagation (can take 24-48 hours)
4. **Build failures**: Check build logs for missing dependencies

### Support Resources:
- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Supabase Documentation: https://supabase.com/docs

## Security Checklist

- [ ] Environment variables are secure
- [ ] API keys are not exposed in client-side code
- [ ] HTTPS is enabled
- [ ] CORS is configured properly
- [ ] Rate limiting is in place (if needed)

## Backup Strategy

- [ ] Database backups configured
- [ ] Code repository is up to date
- [ ] Environment variables are documented
- [ ] Deployment rollback plan is ready 