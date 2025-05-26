import { NextIntlClientProvider, useMessages } from 'next-intl';
import { notFound } from 'next/navigation';
import LanguageSwitcher from '../../components/LanguageSwitcher';

export default function LocaleLayout({ children, params: { locale } }: any) {
  let messages;
  try {
    messages = require(`../../messages/${locale}.json`);
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <LanguageSwitcher />
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 