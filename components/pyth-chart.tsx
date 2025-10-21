"use client"

import React, { useEffect } from "react";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function PythChart() {
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    
    const initWidget = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "PYTH:ETHUSD", // ETH/USD from Pyth
          interval: "15", // 15 minute candles
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview-container",
          backgroundColor: "#000000",
          gridColor: "#1e1e1e",
        });
      }
    };

    if (existingScript) {
      // Script already loaded, just init widget
      initWidget();
    } else {
      // Load script first time
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = initWidget;
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      const container = document.getElementById("tradingview-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container bg-black" style={{ height: "100%", width: "100%" }}>
      <div id="tradingview-container" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}
