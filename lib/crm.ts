import Customer, { type CustomerSegment } from "@/models/Customer";

type UpsertCustomerFromOrderInput = {
  email?: string;
  name?: string;
  phone?: string;
  address?: string;
  orderTotal: number;
  orderDate: Date;
};

function inferSegment(orderCount: number, totalSpent: number, lastOrderAt?: Date): CustomerSegment {
  if (orderCount >= 5 || totalSpent >= 500000) return "high_value";
  if (orderCount >= 2) return "repeat";
  if (lastOrderAt) {
    const days = (Date.now() - lastOrderAt.getTime()) / (1000 * 60 * 60 * 24);
    if (days > 120) return "at_risk";
  }
  return "new";
}

export async function upsertCustomerFromOrder(input: UpsertCustomerFromOrderInput) {
  if (!input.email) return null;

  const email = input.email.trim().toLowerCase();
  if (!email) return null;

  const customer = await Customer.findOne({ email });

  if (!customer) {
    const created = await Customer.create({
      email,
      name: input.name?.trim() || undefined,
      phone: input.phone?.trim() || undefined,
      address: input.address?.trim() || undefined,
      orderCount: 1,
      totalSpent: Math.max(0, Number(input.orderTotal) || 0),
      averageOrderValue: Math.max(0, Number(input.orderTotal) || 0),
      ltv: Math.max(0, Number(input.orderTotal) || 0),
      firstOrderAt: input.orderDate,
      lastOrderAt: input.orderDate,
      segment: "new",
    });
    return created;
  }

  customer.name = input.name?.trim() || customer.name;
  customer.phone = input.phone?.trim() || customer.phone;
  customer.address = input.address?.trim() || customer.address;
  customer.orderCount += 1;
  customer.totalSpent += Math.max(0, Number(input.orderTotal) || 0);
  customer.averageOrderValue = customer.orderCount > 0 ? customer.totalSpent / customer.orderCount : 0;
  customer.ltv = customer.totalSpent;
  customer.lastOrderAt = input.orderDate;
  if (!customer.firstOrderAt) customer.firstOrderAt = input.orderDate;
  customer.segment = inferSegment(customer.orderCount, customer.totalSpent, customer.lastOrderAt);

  await customer.save();
  return customer;
}
