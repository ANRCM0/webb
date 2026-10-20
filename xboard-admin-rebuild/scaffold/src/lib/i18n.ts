import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enUS from "../locales/en-US.json";
import zhCN from "../locales/zh-CN.json";
import ruRU from "../locales/ru-RU.json";
/** recovered: fallbackLng zh-CN, detection querystring>localStorage(i18nextLng)>navigator */
i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { "en-US": enUS, "zh-CN": zhCN, "ru-RU": ruRU } as never,
  fallbackLng: "zh-CN", supportedLngs: ["en-US","zh-CN","ru-RU"],
  detection: { order: ["querystring","localStorage","navigator"], lookupQuerystring: "lang", lookupLocalStorage: "i18nextLng", caches: ["localStorage"] },
  interpolation: { escapeValue: false },
});
export default i18n;
