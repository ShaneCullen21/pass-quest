import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SignatureRequest {
  documentId: string;
  firstSignerId: string;
  secondSignerId: string;
  documentTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { documentId, firstSignerId, secondSignerId, documentTitle }: SignatureRequest = await req.json();

    console.log('Processing signature request:', { documentId, firstSignerId, secondSignerId, documentTitle });

    // Get client details
    const { data: firstSigner, error: firstError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', firstSignerId)
      .single();

    if (firstError || !firstSigner) {
      throw new Error('First signer not found');
    }

    const { data: secondSigner, error: secondError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', secondSignerId)
      .single();

    if (secondError || !secondSigner) {
      throw new Error('Second signer not found');
    }

    // Create signature tokens
    const firstSignerToken = crypto.randomUUID();
    const secondSignerToken = crypto.randomUUID();

    // Update document with signature tracking
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        signing_status: 'pending_first_signature',
        field_data: {
          signing_order: [
            { client_id: firstSignerId, token: firstSignerToken, status: 'pending' },
            { client_id: secondSignerId, token: secondSignerToken, status: 'waiting' }
          ]
        }
      })
      .eq('id', documentId);

    if (updateError) {
      throw new Error('Failed to update document');
    }

    // Generate signing link
    const signingLink = `${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '.lovable.app')}/sign/${documentId}?token=${firstSignerToken}`;

    // Send email to first signer
    const emailResponse = await resend.emails.send({
      from: "DocuSign <noreply@resend.dev>",
      to: [firstSigner.email],
      subject: `Please sign: ${documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Signature Request</h2>
          <p>Hello ${firstSigner.name},</p>
          
          <p>You have been requested to sign the document: <strong>${documentTitle}</strong></p>
          
          <p>Please click the link below to review and sign the document:</p>
          
          <div style="margin: 30px 0;">
            <a href="${signingLink}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Sign Document
            </a>
          </div>
          
          <p><strong>Important:</strong> After you sign, ${secondSigner.name} will automatically receive their copy to sign.</p>
          
          <p style="color: #666; font-size: 12px;">
            This link is unique to you and should not be shared with others.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Signature request sent successfully',
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-signature-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);