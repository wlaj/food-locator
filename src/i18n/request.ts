import {getRequestConfig} from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en-US', 'en', 'nl-NL', 'nl'];
const defaultLocale = 'en-US';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const detectedLocale = cookieStore.get('locale')?.value;
  
  // Use detected locale from middleware, fallback to default
  const locale = detectedLocale && locales.includes(detectedLocale) 
    ? detectedLocale 
    : defaultLocale;

  // Map locale to message file (use base language if specific variant doesn't exist)
  let messageLocale = locale;
  try {
    await import(`../../messages/${locale}.json`);
  } catch {
    // If specific locale file doesn't exist, try base language
    const baseLang = locale.split('-')[0];
    if (baseLang !== locale && locales.some(l => l === baseLang)) {
      messageLocale = baseLang;
    } else {
      messageLocale = defaultLocale.split('-')[0]; // fallback to 'en'
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${messageLocale}.json`)).default
  };
});