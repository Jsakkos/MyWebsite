import { Metadata } from 'next'

export const siteConfig = {
  name: 'Jonathan K. Sakkos',
  title: 'Jonathan K. Sakkos - Senior Process Development Engineer',
  description: 'Senior Process Development Engineer at Curio Bioscience specializing in biotechnology, process automation, and biomaterials. Expert in scaling manufacturing processes for spatial biology platforms.',
  url: 'https://www.jonathanksakkos.com',
  ogImage: '/og-image.png',
  author: {
    name: 'Jonathan K. Sakkos',
    email: 'jonathansakkos@gmail.com',
    twitter: '@jonathanksakkos', // Update with actual handle if exists
  },
  keywords: [
    'biotech',
    'process development', 
    'automation',
    'biotechnology',
    'engineering',
    'spatial biology',
    'curio bioscience',
    'synthetic biology',
    'biomaterials',
    'mechanical engineering'
  ],
}

export function generatePageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.title
  const pageDescription = description || siteConfig.description
  const pageUrl = `${siteConfig.url}${path}`
  const pageImage = image ? `${siteConfig.url}${image}` : `${siteConfig.url}${siteConfig.ogImage}`

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.author.name, url: siteConfig.url }],
    creator: siteConfig.author.name,
    publisher: siteConfig.author.name,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.author.twitter,
    },
    verification: {
      google: '', // Add Google Search Console verification if needed
      yandex: '', // Add Yandex verification if needed
    },
  }
}