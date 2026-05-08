export const PRODUCTS: Record<
  string,
  { id: string; name: string; priceId: string | undefined; amount: number }
> = {
  main:    { id: "main",    name: "Golden Tool",     priceId: Deno.env.get("PRICE_MAIN"),    amount: 2700 },
  ob1:     { id: "ob1",     name: "Lifetime Access", priceId: Deno.env.get("PRICE_OB1"),     amount: 2100 },
  ob2:     { id: "ob2",     name: "3X Boost",        priceId: Deno.env.get("PRICE_OB2"),     amount: 3400 },
  upsell1: { id: "upsell1", name: "New Golden Tool", priceId: Deno.env.get("PRICE_UPSELL1"), amount: 2700 },
  upsell2: { id: "upsell2", name: "Gift Bundle",     priceId: Deno.env.get("PRICE_UPSELL2"), amount: 3700 },
};
