import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: any;
}

export const SEOHead: React.FC<SEOProps> = ({
  title,
  description,
  keywords = 'construction management software, electrical construction, T&D construction, AI construction, transmission lines, distribution systems, substations, field management, construction automation',
  image = 'https://fieldforge.app/og-image.png',
  url = 'https://fieldforge.app',
  type = 'website',
  author = 'FieldForge',
  publishedDate,
  modifiedDate,
  canonical,
  noindex = false,
  structuredData
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attributeName = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attributeName}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attributeName, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', 'FieldForge', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@fieldforge');
    updateMetaTag('twitter:creator', '@fieldforge');
    
    // Article meta tags (if applicable)
    if (type === 'article' && publishedDate) {
      updateMetaTag('article:published_time', publishedDate, true);
      updateMetaTag('article:author', author, true);
      if (modifiedDate) {
        updateMetaTag('article:modified_time', modifiedDate, true);
      }
    }
    
    // Canonical URL
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
    
    // Robots meta tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    }
    
    // Add structured data
    if (structuredData) {
      let script = document.querySelector('script[data-seo="structured-data"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('data-seo', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
    
  }, [title, description, keywords, image, url, type, author, publishedDate, modifiedDate, canonical, noindex, structuredData]);
  
  return null;
};

// Pre-built structured data generators
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'FieldForge',
  url: 'https://fieldforge.app',
  logo: 'https://fieldforge.app/logo.png',
  description: 'AI-powered construction management platform for electrical T&D infrastructure',
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-612-310-3241',
    contactType: 'Sales',
    email: 'sales@fieldforge.app',
    areaServed: 'US',
    availableLanguage: ['English']
  },
  sameAs: [
    'https://twitter.com/fieldforge',
    'https://www.linkedin.com/company/fieldforge',
    'https://github.com/fieldforge'
  ]
});

export const generateSoftwareSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'FieldForge',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android',
  description: 'AI-powered construction management platform for electrical T&D projects',
  offers: {
    '@type': 'Offer',
    price: '500.00',
    priceCurrency: 'USD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '500.00',
      priceCurrency: 'USD',
      unitText: 'MONTH'
    }
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '127'
  },
  featureList: [
    'AI Voice Control',
    'Smart OCR Receipt Scanning',
    'Real-time Project Analytics',
    'Offline PWA Support',
    'Safety Compliance Tracking'
  ]
});

export const generateWebPageSchema = (title: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description: description,
  url: url,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'FieldForge',
    url: 'https://fieldforge.app'
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://fieldforge.app'
      }
    ]
  }
});

export const generateFAQSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is FieldForge?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'FieldForge is an AI-powered construction management platform specifically designed for electrical T&D projects, offering 34% efficiency gains and 45% safety improvements.'
      }
    },
    {
      '@type': 'Question',
      name: 'How does FieldForge improve construction efficiency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Through AI automation, voice control, smart OCR, and real-time analytics, saving field workers 2+ hours daily.'
      }
    },
    {
      '@type': 'Question',
      name: 'Is FieldForge suitable for enterprise?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, FieldForge is enterprise-ready with unlimited scalability, role-based access, and comprehensive audit logging.'
      }
    }
  ]
});
