import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { Header } from '@/components/Header';
import { SeoCtaBanner } from '@/components/SeoCtaBanner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.seoArticle.findUnique({
    where: { slug },
  });

  if (!article) {
    return {
      title: 'Artykuł nie znaleziony | Sonic AI',
    };
  }

  return {
    title: `${article.title} | Sonic AI`,
    description: article.content.substring(0, 150).replace(/[#*]/g, '') + '...',
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await prisma.seoArticle.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const paragraphs = article.content.split('\n\n').filter(p => p.trim() !== '');
  const middleIndex = Math.floor(paragraphs.length / 2);

  const firstHalf = paragraphs.slice(0, middleIndex);
  const secondHalf = paragraphs.slice(middleIndex);

  const renderContent = (blocks: string[]) => {
    return blocks.map((text, i) => {
      if (text.startsWith('# ')) {
        return <h1 key={i} className="text-3xl font-bold mt-10 mb-6 text-white">{text.replace('# ', '').replace(/\*\*/g, '')}</h1>;
      }
      if (text.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-bold mt-8 mb-4 text-white">{text.replace('## ', '').replace(/\*\*/g, '')}</h2>;
      }
      if (text.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold mt-6 mb-3 text-white">{text.replace('### ', '').replace(/\*\*/g, '')}</h3>;
      }
      if (text.startsWith('- ') || text.startsWith('* ')) {
        const items = text.split('\n').map(item => item.replace(/^[-*]\s/, ''));
        return (
          <ul key={i} className="list-disc list-inside space-y-2 mb-4 text-slate-300">
            {items.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </ul>
        );
      }
      return <p key={i} className="mb-4 text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
    });
  };

  return (
    <main className="min-h-[100dvh] bg-background text-foreground flex flex-col relative font-sans">
      <Header />
      
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 pt-24 pb-32">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Wróć do skanera</span>
        </Link>

        <h1 className="text-3xl md:text-5xl font-bold mb-8 text-foreground leading-tight">
          {article.title}
        </h1>

        <div className="prose prose-invert prose-primary max-w-none text-lg">
          {renderContent(firstHalf)}

          <SeoCtaBanner />

          {renderContent(secondHalf)}
        </div>

        <div className="mt-12">
          <SeoCtaBanner />
        </div>
      </div>
    </main>
  );
}
