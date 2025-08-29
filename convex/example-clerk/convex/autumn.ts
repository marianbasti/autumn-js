import { api, components, internal } from "./_generated/api";
import { Autumn } from "@useautumn/convex";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GenericActionCtx } from "convex/server";

export const autumn = new Autumn(components.autumn, {
  identify: async (ctx: any) => {
    let user = await ctx.auth.getUserIdentity();

    if (!user) {
      return null;
    }

    return {
      customerId: user.subject as string,
      customerData: {
        name: user.name as string,
        email: user.email as string,
      },
    };
  },
  apiKey: process.env.AUTUMN_SECRET_KEY ?? "",
});

export const {
  track,
  cancel,
  setupPayment,
  query,
  attach,
  check,
  checkout,
  createEntity,
  deleteEntity,
  getEntity,
  usage,
  listProducts,
  getCustomer,
  getProduct,
  fetchCustomer,
  redeemReferralCode,
  createReferralCode,
  createEntities,
  billingPortal,
} = autumn.api();

export const testAction = action({
  args: v.object({
    bar: v.string(),
  }),
  handler: async (ctx, args) => {
    let s = await autumn.customers.create(ctx, {
      customer_id: "1234",
      name: "John Doe",
      email: "john.doe@example.com",
    });
    return s;
  },
});
