import Stripe from "https://esm.sh/stripe@17.7.0?target=denonext";
import { corsHeaders } from "../_shared/cors.ts";
import { PRODUCTS } from "../_shared/products.ts";
import { notifyIC, type UtmifyProduct } from "../_shared/utmify.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-11-20.acacia",
    });

    const { products, successUrl, cancelUrl, utmParams = {} } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(JSON.stringify({ error: "No products provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lineItems = products.map((key: string) => {
      const p = PRODUCTS[key];
      if (!p?.priceId) throw new Error(`Price ID not configured for: ${key}`);
      return { price: p.priceId, quantity: 1 };
    });

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        src: utmParams.src || "",
        sck: utmParams.sck || "",
        utm_source: utmParams.utm_source || "",
        utm_medium: utmParams.utm_medium || "",
        utm_campaign: utmParams.utm_campaign || "",
        utm_content: utmParams.utm_content || "",
        utm_term: utmParams.utm_term || "",
      },
    });

    // Initiate Checkout (IC) — notify UTMify before payment
    const icProducts: UtmifyProduct[] = products.map((key: string) => {
      const p = PRODUCTS[key];
      return {
        id: p.id,
        name: p.name,
        planId: null,
        planName: null,
        quantity: 1,
        priceInCents: p.amount,
      };
    });
    const totalCents = products.reduce((s: number, k: string) => s + PRODUCTS[k].amount, 0);
    // Fire and forget
    notifyIC(session.id, icProducts, utmParams, totalCents, "usd");

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout-session error:", (err as Error).message);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
