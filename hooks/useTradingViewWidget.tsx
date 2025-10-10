"use client";
import { useEffect, useRef } from "react";

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (container.dataset.loaded) return;

    // Find existing widget container or create one
    let widgetContainer = container.querySelector(
      ".tradingview-widget-container__widget"
    ) as HTMLDivElement;

    if (!widgetContainer) {
      widgetContainer = document.createElement("div");
      widgetContainer.className = "tradingview-widget-container__widget";
      widgetContainer.style.width = "100%";
      widgetContainer.style.height = `${height}px`;
      container.appendChild(widgetContainer);
    } else {
      // Update height if it exists
      widgetContainer.style.height = `${height}px`;
    }

    widgetRef.current = widgetContainer;

    // Create and attach script
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    scriptRef.current = script;

    container.appendChild(script);
    container.dataset.loaded = "true";

    return () => {
      // Clean up script element
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }

      // Clean up created widget container (only if we created it)
      if (
        widgetRef.current &&
        widgetRef.current.parentNode &&
        widgetRef.current.parentNode === container
      ) {
        // Only remove if it's a direct child we created
        const isDirectChild = Array.from(container.children).includes(
          widgetRef.current
        );
        if (isDirectChild) {
          widgetRef.current.parentNode.removeChild(widgetRef.current);
        }
        widgetRef.current = null;
      }

      if (container) {
        delete container.dataset.loaded;
      }
    };
  }, [scriptUrl, config, height]);

  return containerRef;
};
export default useTradingViewWidget;
