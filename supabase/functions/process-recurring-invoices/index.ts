import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find recurring invoices that are paid and need renewal
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .neq('recurring_interval', 'none')
      .not('recurring_interval', 'is', null)
      .eq('status', 'paid');

    if (error) throw error;

    const now = new Date();
    let created = 0;

    for (const inv of (invoices || [])) {
      const paidAt = new Date(inv.paid_at || inv.created_at);
      let nextDue: Date | null = null;

      switch (inv.recurring_interval) {
        case 'weekly':
          nextDue = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          nextDue = new Date(paidAt);
          nextDue.setMonth(nextDue.getMonth() + 1);
          break;
        case 'quarterly':
          nextDue = new Date(paidAt);
          nextDue.setMonth(nextDue.getMonth() + 3);
          break;
      }

      if (!nextDue || nextDue > now) continue;

      // Check if a pending invoice already exists for this recurring chain
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('client_id', inv.client_id)
        .eq('status', 'pending')
        .eq('recurring_interval', inv.recurring_interval)
        .eq('amount', inv.amount)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Create new pending invoice
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const dueDateStr = nextDue.toISOString().split('T')[0];

      await supabase.from('invoices').insert({
        invoice_number: invoiceNumber,
        client_id: inv.client_id,
        project_id: inv.project_id,
        amount: inv.amount,
        currency: inv.currency,
        due_date: dueDateStr,
        notes: `Auto-generated from recurring invoice ${inv.invoice_number}`,
        payment_method: inv.payment_method,
        recurring_interval: inv.recurring_interval,
        status: 'pending',
        created_by: inv.created_by,
      });

      created++;
    }

    return new Response(JSON.stringify({ success: true, created }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
