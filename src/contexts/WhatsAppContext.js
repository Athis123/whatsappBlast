// src/contexts/WhatsAppContext.js
import React, { createContext, useContext, useState } from "react";

const WhatsAppContext = createContext();

export const WhatsAppProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [qrCode, setQrCode] = useState(null);

  return (
    <WhatsAppContext.Provider
      value={{ isReady, setIsReady, qrCode, setQrCode }}
    >
      {children}
    </WhatsAppContext.Provider>
  );
};

export const useWhatsApp = () => useContext(WhatsAppContext);
