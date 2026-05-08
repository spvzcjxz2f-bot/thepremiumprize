import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentParams } from "@/lib/navigation";

function getUtmParams() {
  const raw = getCurrentParams() || window.location.search;
  const p = new URLSearchParams(raw);
  return {
    src: p.get("src") || "",
    sck: p.get("sck") || "",
    utm_source: p.get("utm_source") || "",
    utm_medium: p.get("utm_medium") || "",
    utm_campaign: p.get("utm_campaign") || "",
    utm_content: p.get("utm_content") || "",
    utm_term: p.get("utm_term") || "",
  };
}

export default function Checkout() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("create-checkout-session", {
          body: {
            products: ["main"],
            successUrl: "https://thesuperprogram.lovable.app",
            cancelUrl: `${window.location.origin}/checkout${window.location.search}`,
            utmParams: getUtmParams(),
          },
        });
        if (error) throw new Error(error.message);
        if (!data?.url) throw new Error(data?.error || "No checkout URL returned");
        window.location.href = data.url;
      } catch (e) {
        setError((e as Error).message);
      }
    })();
  }, []);

  if (error) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "red" }}>{error}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <p>Redirecting to secure checkout...</p>
    </div>
  );
}
