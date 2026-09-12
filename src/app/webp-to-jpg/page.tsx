import type { Metadata } from 'next';
import { TOOLS } from '@/lib/constants/tools';
import { ToolShell } from '@/components/tools/ToolShell';
import { JsonLd, generateToolJsonLd } from '@/components/seo/JsonLd';

const tool = TOOLS['webp-to-jpg'];

export const metadata: Metadata = {
  title: tool.seoTitle,
  description: tool.seoDescription,
  alternates: {
    canonical: tool.canonicalPath,
  },
  openGraph: {
    title: tool.seoTitle,
    description: tool.seoDescription,
    url: `https://mjimage.com${tool.canonicalPath}`,
  },
};

export default function WebpToJpgPage() {
  const schemas = generateToolJsonLd(tool);

  return (
    <>
      {schemas.map((schema, i) => (
        <JsonLd key={i} data={schema} />
      ))}
      <ToolShell tool={tool} />
    </>
  );
}
