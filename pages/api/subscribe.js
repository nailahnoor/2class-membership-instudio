import stripe from "../../lib/stripe";
import { DateTime } from "luxon"; // Add this import

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, email, phone, paymentMethodId, address } = req.body;
    if (!paymentMethodId || !email)
      return res.status(400).json({ error: "Missing required fields" });

    const customer = await stripe.customers.create({
      individual_name: name, // ✅ Contact details name goes here
      email,
      phone,
      address: {
        line1: address.line1 || "",
        line2: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        country: address.country || "",
      },
      payment_method: paymentMethodId,
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // --- START: Calculate first of next month in Central Time at 6 AM ---
    const nowCT = DateTime.now().setZone("America/Chicago");
    const firstOfNextMonthCT = nowCT.plus({ months: 1 }).startOf("month").set({ hour: 6, minute: 0, second: 0 });
    const billingCycleAnchor = Math.floor(firstOfNextMonthCT.toSeconds());
    // --- END ---

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      billing_cycle_anchor: billingCycleAnchor,
      proration_behavior: "none",
      collection_method: "charge_automatically",
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 4500,
      currency: "usd",
      customer: customer.id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,

      // ✅ Added for Zapier + Google Sheets consistency
      description:
        "2 Group Classes / Monthly Membership (Auto-Pay) / In-Studio",

      metadata: {
        mode: "subscription",
        payment_type: "signup",
        membership_name:
          "2 Group Classes / Monthly Membership (Auto-Pay) / In-Studio",
        source: "custom_app",
        subscription_id: subscription.id, // ✅ NEW: attach subscription ID
      },
    });

    return res.status(200).json({
      success: true,
      subscriptionId: subscription.id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
