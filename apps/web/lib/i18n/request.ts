import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "en";

  const supportedLocales = ["en", "am"];

  const validLocale = supportedLocales.includes(locale)
    ? locale
    : "en";

  return {
    locale: validLocale,
    messages: (
      await import(`../messages/${validLocale}.json`)
    ).default,
  };
});