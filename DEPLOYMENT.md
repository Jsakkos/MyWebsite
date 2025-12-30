# Deployment Guide

## Netlify Deployment

### Prerequisites
1. GitHub repository with the new website code
2. Netlify account connected to your GitHub
3. Self-hosted Caltrain tracker API running and accessible

### Environment Variables
Set these in Netlify's environment variables:

```
NEXT_PUBLIC_CALTRAIN_API_URL=https://your-caltrain-domain.com
```

### Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: `20.x`

### Domain Configuration
1. Add your custom domain in Netlify site settings
2. Update DNS records to point to Netlify
3. Enable HTTPS/SSL certificate

### Redirects
The `netlify.toml` file includes redirects from your old Hugo URLs to the new Next.js structure:
- `/author/*` → `/about`
- `/publication/*` → `/publications`
- `/project/*` → `/projects`
- `/post/*` → `/blog`

## Caltrain API Integration

### Self-Hosted Backend
Your Caltrain tracker should remain self-hosted with these endpoints available:
- `GET /api/stats/overall` - Overall performance statistics
- `GET /api/stats/delays-by-hour` - Delay data by hour
- `GET /api/health` - Health check endpoint

### CORS Configuration
Ensure your FastAPI backend allows requests from your new domain:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.jonathanksakkos.com"],  # Update with your domain
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### Fallback Behavior
The website includes mock data fallbacks, so it will work even if your API is temporarily unavailable.

## Post-Deployment Steps

1. **Test all pages** and functionality
2. **Verify API integration** with live Caltrain data
3. **Check redirects** from old URLs
4. **Test mobile responsiveness**
5. **Verify dark/light mode** functionality
6. **Check contact form** submission (currently shows success message only)
7. **Update any hardcoded URLs** to use your actual domain

## Monitoring

- Monitor API health at `/api/caltrain/health`
- Check Netlify deploy logs for any build issues
- Set up Google Analytics if desired

## Future Enhancements

1. **Contact Form**: Integrate with Netlify Forms or a service like Formspree
2. **Analytics**: Add Google Analytics or similar
3. **Blog Comments**: Add comment system if desired
4. **Newsletter**: Integrate with email service if planning regular content
5. **Performance**: Monitor Core Web Vitals and optimize as needed