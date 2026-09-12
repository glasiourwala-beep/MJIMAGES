import React from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export function generateWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MJImage',
    url: 'https://mjimage.com',
    description: 'Fast, secure, and privacy-conscious online image processing suite. Compress, resize, crop, and convert images for free.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://mjimage.com/{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateToolJsonLd(tool: {
  name: string;
  shortDescription: string;
  canonicalPath: string;
  faqs: { question: string; answer: string }[];
}) {
  const schemas: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: `MJImage ${tool.name}`,
      url: `https://mjimage.com${tool.canonicalPath}`,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      browserRequirements: 'Requires JavaScript. Requires HTML5.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: tool.shortDescription,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://mjimage.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: tool.name,
          item: `https://mjimage.com${tool.canonicalPath}`,
        },
      ],
    },
  ];

  if (tool.faqs && tool.faqs.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: tool.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }

  return schemas;
}
