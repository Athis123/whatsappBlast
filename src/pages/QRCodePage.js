import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useWhatsApp } from "../contexts/WhatsAppContext"; // ✅

const QRCodePage = () => {
  const { isReady, setIsReady, qrCode, setQrCode } = useWhatsApp(); // ✅
  const [timeLeft, setTimeLeft] = useState(0);
  const [qrExpired, setQrExpired] = useState(false);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const qrReceived = useRef(false);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("qr", (qr) => {
      if (qrReceived.current || isReady) return;
      setQrCode(qr);
      setTimeLeft(60);
      setQrExpired(false);
      qrReceived.current = true;
      startTimer();
    });

    socketRef.current.on("ready", () => {
      setIsReady(true);
      clearInterval(timerRef.current);
      timerRef.current = null;
      setQrCode(null);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReady, setIsReady, setQrCode]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setQrExpired(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };

  const handleDisconnect = () => {
    socketRef.current.emit("request-new-qr");
    setIsReady(false);
    setQrCode(null);
    setTimeLeft(0);
    qrReceived.current = false;
  };

  const handleNextPage = () => {
    if (isReady) {
      navigate("/send-message");
    } else {
      alert("WhatsApp belum siap!");
    }
  };

  return (
    <div className="contain-page">
      <div className="qr-code-page">
        <h1>WhatsApp QR Code</h1>

        {isReady && (
          <div className="connected-status">
            <p style={{ color: "green", fontSize: "1.2em", marginTop: "10px" }}>
              ✅ Client berhasil terhubung!
            </p>
          </div>
        )}

        {!isReady && qrCode && (
          <>
            <QRCodeCanvas value={qrCode} size={256} />
            <div className="timer">
              <p>QR Code berlaku selama: {timeLeft} detik</p>
            </div>
          </>
        )}

        {!isReady && !qrCode && <p>Loading...</p>}

        <div style={{ marginTop: "30px" }}>
          {isReady && (
            <button
              onClick={handleDisconnect}
              style={{ backgroundColor: "#f44336" }}
            >
              Disconnect Client
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
