import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { order_id, listing_id, buyer_email, seller_email, listing_title, amount } = body;

    // Create notification for buyer
    await base44.asServiceRole.entities.Notification.create({
      user_email: buyer_email,
      type: "order",
      title: "Order Confirmed!",
      message: `Your purchase of "${listing_title}" for ₱${amount?.toLocaleString()} is confirmed.`,
      link: "/dashboard?tab=orders",
      related_id: order_id,
    });

    // Create notification for seller
    await base44.asServiceRole.entities.Notification.create({
      user_email: seller_email,
      type: "sale",
      title: "New Sale! 💰",
      message: `You sold "${listing_title}" for ₱${amount?.toLocaleString()}. Payout: ₱${(amount * 0.9)?.toLocaleString()}.`,
      link: "/dashboard?tab=sales",
      related_id: order_id,
    });

    // Increment listing total_sales (using views as proxy for downloads)
    if (listing_id) {
      const listings = await base44.asServiceRole.entities.Listing.filter({ id: listing_id });
      if (listings.length > 0) {
        const listing = listings[0];
        await base44.asServiceRole.entities.Listing.update(listing_id, {
          views: (listing.views || 0) + 1,
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});