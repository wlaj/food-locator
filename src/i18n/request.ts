import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // Default to Dutch (nl)
  const locale = 'nl';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});