# Professional Website - Jonathan K. Sakkos

A modern, professional website built with Next.js 16, showcasing biotech engineering expertise and technical projects.

## 🚀 Features

- **Modern Stack**: Next.js 16 with TypeScript and Tailwind CSS
- **Professional Design**: Clean, responsive design optimized for biotech industry
- **Live Data Integration**: Real-time Caltrain performance tracker integration
- **MDX Blog**: Technical blog with markdown support
- **Dark/Light Mode**: System-aware theme switching
- **SEO Optimized**: Comprehensive metadata, sitemap, and performance optimization

## 📋 Site Structure

- **Homepage**: Professional introduction with live project showcase
- **About**: Detailed background and competencies
- **Experience**: Career timeline with achievements
- **Projects**: Technical project portfolio
- **Blog**: MDX-powered technical articles
- **Publications**: Streamlined academic publications
- **Contact**: Professional contact form

## 🛠 Technical Stack

- **Framework**: Next.js 16 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Content**: MDX for blog posts and documentation
- **Icons**: Lucide React
- **Theme**: Next-themes for dark/light mode
- **Deployment**: Netlify with automatic deployments

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the site.

### Build
```bash
npm run build
```

## 🌐 API Integration

The site integrates with a self-hosted Caltrain performance tracker:

- **Live Data**: Real-time transit performance metrics
- **Fallback**: Mock data when API is unavailable
- **Health Monitoring**: API status monitoring
- **CORS Support**: Cross-origin requests configured

### Environment Variables
```env
NEXT_PUBLIC_CALTRAIN_API_URL=https://your-caltrain-domain.com
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable React components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API clients
├── content/            # MDX blog posts
└── public/             # Static assets
```

## 🚀 Deployment

### Netlify Configuration
- Build command: `npm run build`
- Publish directory: `.next`
- Environment: Node.js 18

### URL Redirects
Automatic redirects from old Hugo URLs to new Next.js structure included in `netlify.toml`.

## 🎯 Key Features

### Caltrain Tracker Integration
- Real-time performance dashboard with live API integration
- Interactive data visualizations using React components
- API health monitoring and fallback handling
- Mobile-responsive design for all devices

### Professional Focus
- Biotech industry optimization and modern design
- Process development emphasis throughout content
- Technical project showcase with detailed case studies
- Academic background integrated but not primary focus

## 📝 Content Management

### Blog Posts
Create new MDX files in `content/posts/`:
```markdown
---
title: "Post Title"
date: "2024-12-08"
excerpt: "Brief description"
tags: ["tag1", "tag2"]
---

Content here...
```

## 🙋‍♂️ Author

**Jonathan K. Sakkos**
- Staff Process Development Engineer at Takara Bio USA, Inc.
- LinkedIn: [jonathan-sakkos](https://www.linkedin.com/in/jonathan-sakkos-b2833a4/)
- GitHub: [jsakkos](https://github.com/jsakkos)
