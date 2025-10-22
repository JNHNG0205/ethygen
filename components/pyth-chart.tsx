"use client"

import React, { useEffect, useMemo } from "react";
import { useMarket } from "@/hooks/use-market";

declare global {
  interface Window {
    TradingView: any;
  }
}

export default function PythChart() {
  const { asset, setAsset } = useMarket()

  // Map asset like "ETH/yUSDe" to TradingView Pyth symbol "PYTH:ETHUSD"
  const tvSymbol = useMemo(() => {
    const base = asset.split("/")[0] || "ETH"
    return `PYTH:${base}USD`
  }, [asset])

  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    
    const initWidget = () => {
      if (window.TradingView) {
        // Clear previous widget content before re-initializing
        const container = document.getElementById("tradingview-container")
        if (container) container.innerHTML = ""
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol, // Selected asset via Pyth on TradingView
          interval: "15", // 15 minute candles
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0a0a0a",
          enable_publishing: false,
          allow_symbol_change: false, // Lock chart to trading pair
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
  }, [tvSymbol]);

  return (
    <div className="tradingview-widget-container bg-black" style={{ height: "100%", width: "100%" }}>
      <div id="tradingview-container" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}
