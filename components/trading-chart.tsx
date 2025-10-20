"use client"

import { useEffect, useRef } from "react"

export function TradingChart() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // TradingView Lightweight Charts configuration
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      if (typeof window !== "undefined" && (window as any).TradingView) {
        ;new (window as any).TradingView.widget({
          autosize: true,
          symbol: "BINANCE:ETHUSDT",
          interval: "5",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#000000",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: "tradingview_chart",
          backgroundColor: "#000000",
          gridColor: "#1e1e1e",
          studies: [],
          overrides: {
            "paneProperties.background": "#000000",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#1e1e1e",
            "paneProperties.horzGridProperties.color": "#1e1e1e",
            "scalesProperties.textColor": "#a0a0a0",
            "mainSeriesProperties.candleStyle.upColor": "#00d4ff",
            "mainSeriesProperties.candleStyle.downColor": "#d50000",
            "mainSeriesProperties.candleStyle.borderUpColor": "#00d4ff",
            "mainSeriesProperties.candleStyle.borderDownColor": "#d50000",
            "mainSeriesProperties.candleStyle.wickUpColor": "#00d4ff",
            "mainSeriesProperties.candleStyle.wickDownColor": "#d50000",
          },
        })
      }
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return (
    <div className="h-full w-full bg-black relative">
      <div id="tradingview_chart" ref={containerRef} className="h-full w-full" />
    </div>
  )
}
