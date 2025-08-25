import { getLocales } from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import uz from "./uz.json";

const resources = {
    en: { translation: en },
    uz: { translation: uz },
};

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
    resources,
    lng: getLocales()[0].languageCode || "en",
    fallbackLng: "en",
    compatibilityJSON: "v4",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;