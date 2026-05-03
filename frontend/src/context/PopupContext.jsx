import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import Popup from "../components/Popup";

const PopupContext = createContext(null);

export function PopupProvider({ children }) {
  const [popup, setPopup] = useState({ visible: false, message: "", type: "info" });
  const timeoutRef = useRef(null);

  const showPopup = useCallback((message, type = "info", duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPopup({ visible: true, message, type });
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setPopup((p) => ({ ...p, visible: false }));
        timeoutRef.current = null;
      }, duration);
    }
  }, []);

  const showConfirmPopup = useCallback((message, onConfirm) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPopup({ visible: true, message, type: "confirm", onConfirm });
  }, []);

  const hidePopup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setPopup((p) => ({ ...p, visible: false }));
  }, []);

  const confirmPopup = useCallback(() => {
    const onConfirm = popup.onConfirm;
    hidePopup();
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  }, [hidePopup, popup.onConfirm]);

  return (
    <PopupContext.Provider value={{ showPopup, showConfirmPopup, hidePopup }}>
      {children}
      <Popup
        visible={popup.visible}
        message={popup.message}
        onClose={hidePopup}
        onConfirm={confirmPopup}
        type={popup.type}
      />
    </PopupContext.Provider>
  );
}

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within a PopupProvider");
  return ctx;
}

export default PopupContext;
