import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { buyer_email, seller_email, listing_title, amount, commission, seller_payout, order_id } = body;

    // Send notification to buyer
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: buyer_email,
      subject: "✅ Purchase Successful — GAMER Productions",
      body: `Hey Gamer!\n\nYour purchase was successful! 🎮\n\nItem: ${listing_title}\nAmount Paid: ₱${amount?.toLocaleString()}\nOrder ID: ${order_id || "N/A"}\n\nYour download link or details will be delivered by the seller shortly.\n\nThank you for shopping on GAMER Productions!\n\n— GAMER Productions Team 🕹️`,
    });

    // Send notification to seller
    if (seller_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: seller_email,
        subject: "💰 You Made a Sale! — GAMER Productions",
        body: `Congratulations! 🎉\n\nYou just made a sale on GAMER Productions!\n\nItem Sold: ${listing_title}\nSale Amount: ₱${amount?.toLocaleString()}\nPlatform Commission (10%): ₱${commission?.toLocaleString()}\nYour Payout: ₱${seller_payout?.toLocaleString()}\n\nPayout will be processed to your PayPal within 1-3 business days.\n\nKeep it up — GAMER Productions Team 🕹️`,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});