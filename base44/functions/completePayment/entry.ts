import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Allow service role calls for webhook processing
    const { orderData, paypalOrderId } = await req.json();

    // Create global transaction record
    const globalTransaction = await base44.asServiceRole.entities.GlobalTransactions.create({
      order_id: orderData.id || crypto.randomUUID(),
      buyer_email: orderData.buyer_email,
      seller_email: orderData.seller_email,
      seller_paypal_id: orderData.seller_paypal_id,
      total_amount: orderData.total_amount,
      admin_fee: orderData.admin_fee || (orderData.total_amount * 0.1), // 10% commission
      seller_payout: orderData.seller_payout || (orderData.total_amount * 0.9),
      paypal_order_id: paypalOrderId,
      payment_status: 'completed',
      split_status: 'split',
      transaction_date: new Date().toISOString()
    });

    // Update individual order
    if (orderData.order_id) {
      try {
        await base44.asServiceRole.entities.Order.update(orderData.order_id, {
          payment_status: 'paid',
          order_status: 'completed',
          transaction_id: paypalOrderId
        });
      } catch (e) {
        console.log('Order update skipped:', e.message);
      }
    }

    return Response.json({ 
      success: true, 
      transaction_id: globalTransaction.id,
      message: 'Transaction completed and split recorded'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});