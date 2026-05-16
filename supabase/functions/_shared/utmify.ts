const URL_ = Deno.env.get("UTMIFY_WEBHOOK_URL") || "https://api.utmify.com.br/api-credentials/orders";
const KEY = Deno.env.get("UTMIFY_API_KEY") || "";

export interface UtmParams {
  src?: string | null;
  sck?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export interface UtmifyProduct {
  id: string;
  name: string;
  planId: string | null;
  planName: string | null;
  quantity: number;
  priceInCents: number;
}

// Fetch live USD->BRL rate (cached for the life of the isolate)
let cachedRate: { rate: number; at: number } | null = null;
async function getUsdToBrlRate(): Promise<number> {
  const FALLBACK = 5.4;
  const TTL_MS = 10 * 60 * 1000; // 10 min
  if (cachedRate && Date.now() - cachedRate.at < TTL_MS) return cachedRate.rate;
  try {
    const res = await fetch("https://economia.awesomeapi.com.br/last/USD-BRL");
    const json = await res.json();
    const bid = parseFloat(json?.USDBRL?.bid);
    if (bid && isFinite(bid) && bid > 0) {
      cachedRate = { rate: bid, at: Date.now() };
      console.log("USD->BRL rate fetched:", bid);
      return bid;
    }
  } catch (e) {
    console.error("USD->BRL rate fetch error:", (e as Error).message);
  }
  return FALLBACK;
}

async function convertToBrlCents(amountCents: number, currency: string | null | undefined): Promise<number> {
  const cur = (currency || "usd").toLowerCase();
  if (cur === "brl") return amountCents;
  if (cur === "usd") {
    const rate = await getUsdToBrlRate();
    return Math.round(amountCents * rate);
  }
  // Unknown currency — treat as USD as a safe default for this project
  const rate = await getUsdToBrlRate();
  return Math.round(amountCents * rate);
}

function buildPayload(
  orderId: string,
  status: "waiting_payment" | "paid",
  products: UtmifyProduct[],
  utmParams: UtmParams,
  customer: any,
  totalCents: number,
  createdAt: string,
) {
  return {
    orderId,
    platform: "other",
    paymentMethod: "credit_card",
    status,
    createdAt,
    approvedDate: status === "paid" ? new Date().toISOString() : null,
    refundedAt: null,
    customer: {
      name: customer?.name || "Unknown",
      email: customer?.email || "unknown@unknown.com",
      phone: customer?.phone || null,
      document: customer?.document || null,
      country: customer?.address?.country || null,
      ip: customer?.ip || "0.0.0.0",
    },
    products,
    trackingParameters: {
      src: utmParams.src || null,
      sck: utmParams.sck || null,
      utm_source: utmParams.utm_source || null,
      utm_medium: utmParams.utm_medium || null,
      utm_campaign: utmParams.utm_campaign || null,
      utm_content: utmParams.utm_content || null,
      utm_term: utmParams.utm_term || null,
    },
    commission: {
      totalPriceInCents: totalCents,
      gatewayFeeInCents: 0,
      userCommissionInCents: totalCents,
    },
  };
}

export async function notifyIC(
  orderId: string,
  products: UtmifyProduct[],
  utmParams: UtmParams,
  totalCents: number,
  currency: string = "usd",
) {
  try {
    // Convert each product price + total from source currency to BRL cents
    const convertedProducts: UtmifyProduct[] = [];
    for (const p of products) {
      convertedProducts.push({
        ...p,
        priceInCents: await convertToBrlCents(p.priceInCents, currency),
      });
    }
    const brlTotal = await convertToBrlCents(totalCents, currency);
    await fetch(URL_, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": KEY },
      body: JSON.stringify(
        buildPayload(orderId, "waiting_payment", convertedProducts, utmParams, null, brlTotal, new Date().toISOString()),
      ),
    });
  } catch (e) {
    console.error("UTMify IC error:", (e as Error).message);
  }
}

export async function notifyPurchase(session: any, lineItems: any[]) {
  const meta = session.metadata || {};
  const utmParams: UtmParams = {
    src: meta.src,
    sck: meta.sck,
    utm_source: meta.utm_source,
    utm_medium: meta.utm_medium,
    utm_campaign: meta.utm_campaign,
    utm_content: meta.utm_content,
    utm_term: meta.utm_term,
  };
  const currency: string = session.currency || "usd";
  const products: UtmifyProduct[] = [];
  for (const item of lineItems) {
    const qty = item.quantity || 1;
    const unit = item.price?.unit_amount ?? 0;
    const rawPrice = unit > 0 ? unit * qty : (item.amount_total || 0);
    const priceInCents = await convertToBrlCents(rawPrice, currency);
    products.push({
      id: item.price?.id || item.id,
      name: item.description || "",
      planId: null,
      planName: null,
      quantity: qty,
      priceInCents,
    });
  }
  const rawTotal = session.amount_total
    ?? lineItems.reduce((s: number, it: any) => {
      const qty = it.quantity || 1;
      const unit = it.price?.unit_amount ?? 0;
      return s + (unit > 0 ? unit * qty : (it.amount_total || 0));
    }, 0);
  const totalCents = await convertToBrlCents(rawTotal, currency);
  try {
    const payload = buildPayload(
      session.id,
      "paid",
      products,
      utmParams,
      session.customer_details,
      totalCents,
      new Date(session.created * 1000).toISOString(),
    );
    console.log("UTMify Purchase payload (BRL converted from", currency + "):", JSON.stringify(payload));
    const res = await fetch(URL_, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": KEY },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log("UTMify Purchase response:", res.status, text);
  } catch (e) {
    console.error("UTMify Purchase error:", (e as Error).message);
  }
}
