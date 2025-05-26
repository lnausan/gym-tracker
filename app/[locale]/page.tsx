import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('home');
  return (
    <main className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-700 mt-6">{t('welcome')}</h1>
      <p className="text-center text-gray-500 text-lg max-w-xl mx-auto mb-4 font-sans">
        {t('description')}
      </p>
    </main>
  );
} 