import React, { createContext, useContext, useState } from "react";

const TEXT = {
  en: {
    dashboard: "Dashboard",
    records: "Records",
    upload: "Upload Record",
    processing: "Processing",
    verification: "Verification",
    gis: "GIS Map",
    analytics: "Analytics",
    audit: "Audit Trail",

    welcome: "Welcome to",
    command: "Land Intelligence Center",

    digitize: "Digitize Land Record",
    process: "Start Processing",
    validate: "Validate Record",
    verify: "Verify & Approve",

    confidence: "Confidence Score",
    status: "Status",
    search: "Search land records...",
  },

  hi: {
    dashboard: "डैशबोर्ड",
    records: "रिकॉर्ड",
    upload: "रिकॉर्ड अपलोड करें",
    processing: "AI प्रोसेसिंग",
    verification: "सत्यापन",
    gis: "GIS मानचित्र",
    analytics: "विश्लेषण",
    audit: "ऑडिट ट्रेल",

    welcome: "स्वागत है",
    command: "भूमि इंटेलिजेंस सेंटर",

    digitize: "भूमि रिकॉर्ड डिजिटाइज़ करें",
    process: "AI प्रोसेसिंग शुरू करें",
    validate: "रिकॉर्ड सत्यापित करें",
    verify: "सत्यापित करें",

    confidence: "AI विश्वास स्तर",
    status: "स्थिति",
    search: "भूमि रिकॉर्ड खोजें...",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  const t = (key) => TEXT[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}