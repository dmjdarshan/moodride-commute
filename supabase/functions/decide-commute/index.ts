import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, destination, preferredMode, priority, extraNotes, persona, email } = await req.json();
    
    const MAKE_AGENT_WEBHOOK = Deno.env.get('MAKE_AGENT_WEBHOOK');
    const MAKE_API_KEY = Deno.env.get('MAKE_API_KEY');
    
    if (!MAKE_AGENT_WEBHOOK || !MAKE_API_KEY) {
      console.error('Missing MAKE_AGENT_WEBHOOK or MAKE_API_KEY');
      throw new Error('Make.com webhook configuration is missing');
    }

    // Build the mode list
    let modeDescription = '';
    if (preferredMode === 'any') {
      modeDescription = 'any mode (bike, car, metro, cab/auto)';
    } else if (preferredMode === 'bike') {
      modeDescription = 'bike';
    } else if (preferredMode === 'car') {
      modeDescription = 'car';
    } else if (preferredMode === 'metro') {
      modeDescription = 'metro + last mile';
    } else if (preferredMode === 'cab') {
      modeDescription = 'cab/auto';
    }

    // Build priority description
    let priorityDescription = '';
    if (priority === 'ontime') {
      priorityDescription = 'reaching on time';
    } else if (priority === 'budget') {
      priorityDescription = 'saving money/budget';
    } else if (priority === 'convenience') {
      priorityDescription = 'convenience and comfort';
    }

    // Build persona preferences
    let personaPreferences = '';
    if (persona) {
      const budgetLevel = persona.budgetVsConvenience <= 33 ? 'budget-conscious' : 
                          persona.budgetVsConvenience <= 66 ? 'balanced between budget and convenience' : 
                          'convenience-focused';
      const ontimeLevel = persona.ontimePreference <= 3 ? 'flexible with timing' :
                          persona.ontimePreference <= 7 ? 'moderately punctual' :
                          'very punctual and time-conscious';
      
      personaPreferences = `My general preferences: I am ${budgetLevel} and ${ontimeLevel} (on-time importance: ${persona.ontimePreference}/10, budget vs convenience: ${persona.budgetVsConvenience}/100 where 0 is budget-focused and 100 is convenience-focused).`;
      
      if (persona.likesDrivingCar !== undefined) {
        personaPreferences += ` I ${persona.likesDrivingCar ? 'enjoy' : "don't enjoy"} driving my car.`;
      }
      if (persona.likesRidingBike !== undefined) {
        personaPreferences += ` I ${persona.likesRidingBike ? 'enjoy' : "don't enjoy"} riding my bike.`;
      }
    }

    // Build the input prompt
    let inputPrompt = `Plan the best commute options for me from ${source} to ${destination} for today. My today's preferred mode is ${modeDescription}. What matters for me today in the commute is ${priorityDescription}.`;
    
    if (extraNotes && extraNotes.trim()) {
      inputPrompt += ` I also want you to note that: ${extraNotes.trim()}`;
    }
    
    if (personaPreferences) {
      inputPrompt += ` ${personaPreferences}`;
    }

    console.log('Sending to Make.com webhook:', inputPrompt);
    console.log('Email settings:', email);

    const response = await fetch(MAKE_AGENT_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-make-apikey': MAKE_API_KEY,
      },
      body: JSON.stringify({
        input: inputPrompt,
        email: {
          send: email?.send || false,
          address: email?.address || ''
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Make.com webhook error:', response.status, errorText);
      throw new Error(`Make.com webhook returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Make.com response:', JSON.stringify(data));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in decide-commute function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      // Return dummy data as fallback
      fallback: true,
      mvpOption: {
        mode: "Metro + Rapido",
        time: "45 mins",
        cost: "₹85",
        stressLevel: "Low",
        reasoning: "Metro is most predictable during morning rush. Purple line, then Rapido for last mile."
      },
      alternatives: [
        {
          mode: "Bike",
          time: "35-60 mins",
          cost: "₹30",
          stressLevel: "Medium",
          reasoning: "Could be faster, but ORR traffic is unpredictable."
        },
        {
          mode: "Ola Cab",
          time: "55 mins",
          cost: "₹420",
          stressLevel: "Low",
          reasoning: "Most comfortable, but traffic makes it slower than metro."
        }
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
