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
) {
  try {
    await fetch(URL_, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-token": KEY },
      body: JSON.stringify(
        buildPayload(orderId, "waiting_payment", products, utmParams, null, totalCents, new Date().toISOString()),
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
  const products: UtmifyProduct[] = lineItems.map((item: any) => {
    const qty = item.quantity || 1;
    const unit = item.price?.unit_amount ?? 0;
    const priceInCents = unit > 0 ? unit * qty : (item.amount_total || 0);
    return {
      id: item.price?.id || item.id,
      name: item.description || "",
      planId: null,
      planName: null,
      quantity: qty,
      priceInCents,
    };
  });
  const totalCents = session.amount_total
    ?? products.reduce((s, p) => s + p.priceInCents, 0);
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
    console.log("UTMify Purchase payload:", JSON.stringify(payload));
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
