type AttributedOrder = {
  amount: number;
  status: string;
  regularPrice: number;
};

export function saleAmounts(amount: number, recordedRegularPrice: unknown) {
  const regularPrice = typeof recordedRegularPrice === "number" &&
    Number.isSafeInteger(recordedRegularPrice) && recordedRegularPrice >= amount
    ? recordedRegularPrice
    : amount;
  return { regularPrice, discount: regularPrice - amount, amount };
}

export function summarizePartnerSales(orders: AttributedOrder[]) {
  const paid = orders.filter((order) => order.status === "PAID");
  const pending = orders.filter((order) => order.status === "PENDING");
  return {
    attributedOrders: orders.length,
    paidSales: paid.length,
    pendingSales: pending.length,
    gross: paid.reduce((sum, order) => sum + order.regularPrice, 0),
    discountGiven: paid.reduce((sum, order) => sum + order.regularPrice - order.amount, 0),
    revenue: paid.reduce((sum, order) => sum + order.amount, 0),
    pendingDiscount: pending.reduce((sum, order) => sum + order.regularPrice - order.amount, 0),
  };
}
