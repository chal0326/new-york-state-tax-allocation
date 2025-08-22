import type { Route } from "./+types/api.save-calculation";

export default function SaveCalculation() {
  return null; // This is an API route, no component needed
}

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const data = await request.json();
    
    // Generate a simple session ID (you could use a more sophisticated approach)
    const sessionId = crypto.randomUUID();
    
    // Get request headers for logging
    const userAgent = request.headers.get('User-Agent') || '';
    const ipAddress = request.headers.get('CF-Connecting-IP') || 
                     request.headers.get('X-Forwarded-For') || 
                     'unknown';

    // Insert the calculation data into D1
    const stmt = context.cloudflare.env.TAX_DB.prepare(`
      INSERT INTO tax_calculations (
        session_id, income, filing_status, tax_type, 
        calculated_tax, tax_amount_entered, calculation_method, 
        allocations, ip_address, user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.bind(
      sessionId,
      data.income || null,
      data.filingStatus || null,
      data.taxType || null,
      data.calculatedTax || null,
      data.taxAmountEntered || null,
      data.calculationMethod || null,
      JSON.stringify(data.allocations || {}),
      ipAddress,
      userAgent
    ).run();

    return Response.json({ 
      success: true, 
      sessionId,
      message: 'Calculation saved successfully' 
    });

  } catch (error) {
    console.error('Error saving calculation:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to save calculation' 
    }, { status: 500 });
  }
}