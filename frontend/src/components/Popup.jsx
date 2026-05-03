import React, { useState } from "react";

export default function Popup({ visible, message, onClose, onConfirm, type = "info" }) {
  const [hoverCancel, setHoverCancel] = useState(false);
  const [hoverConfirm, setHoverConfirm] = useState(false);

  if (!visible) return null;

  const backdropStyle = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    pointerEvents: "none",
    zIndex: 9999,
    paddingTop: "88px",
  };

  const boxStyle = {
    pointerEvents: "auto",
    background: "linear-gradient(135deg, #d8a336, #c48e25)",
    color: "#07213a",
    padding: "30px 38px",
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(3,24,48,0.18)",
    maxWidth: 860,
    minWidth: 520,
    textAlign: "center",
    fontSize: 17,
    border: "1px solid rgba(100,140,180,0.28)",
  };

  const closeBtnStyle = {
    position: "absolute",
    top: 8,
    right: 10,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    zIndex: 10000,
    pointerEvents: "auto",
  };

  const actionsStyle = {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  };

  const actionButtonStyle = {
    border: "none",
    borderRadius: "999px",
    padding: "10px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
  };

  const confirmButtonStyle = {
    ...actionButtonStyle,
    background: hoverConfirm ? "rgba(255, 255, 255, 0.85)" : "#ffffff",
    color: "#07213a",
    transition: "background 0.2s ease",
  };

  const cancelButtonStyle = {
    ...actionButtonStyle,
    background: hoverCancel ? "rgba(7, 33, 58, 0.25)" : "rgba(7, 33, 58, 0.12)",
    color: "#07213a",
    transition: "background 0.2s ease",
  };

  return (
    <div style={backdropStyle} aria-live="polite">
      <div style={{ position: "relative" }}>
        <div style={boxStyle} role={type === "confirm" ? "alertdialog" : "status"}>
          {message}
          {type === "confirm" && (
            <div style={actionsStyle}>
              <button 
                type="button" 
                onClick={onClose} 
                style={cancelButtonStyle}
                onMouseEnter={() => setHoverCancel(true)}
                onMouseLeave={() => setHoverCancel(false)}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={onConfirm} 
                style={confirmButtonStyle}
                onMouseEnter={() => setHoverConfirm(true)}
                onMouseLeave={() => setHoverConfirm(false)}
              >
                Confirmar
              </button>
            </div>
          )}
        </div>
        <button aria-label="Fechar" onClick={onClose} style={closeBtnStyle}>✕</button>
      </div>
    </div>
  );
}
