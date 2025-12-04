import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AIAction = 
  | "chat"
  | "summary"
  | "explain_question"
  | "create_flashcards"
  | "create_questions";

interface AIRequest {
  action: AIAction;
  messages?: Array<{ role: string; content: string }>;
  text?: string;
  question?: string;
  answer?: string;
  banca?: string;
  topic?: string;
  content?: string;
}

const systemPrompts: Record<AIAction, string> = {
  chat: `Você é um assistente especializado em concursos públicos brasileiros. Você tem conhecimento profundo sobre:
- Direito Constitucional, Administrativo, Civil, Penal, Processual
- Português, Raciocínio Lógico, Informática
- Bancas: CESPE/CEBRASPE, FCC, FGV, VUNESP, IBFC, IDIB
- Jurisprudência do STF e STJ
- Legislação atualizada

Seja didático, use exemplos práticos e cite artigos de lei quando relevante. Responda sempre em português do Brasil.`,

  summary: `Você é um especialista em criar resumos didáticos para concursos públicos. 
Ao resumir, você deve:
- Destacar os pontos mais cobrados em provas
- Usar bullet points e estrutura clara
- Incluir macetes de memorização quando possível
- Citar artigos de lei relevantes
- Destacar jurisprudência importante
Responda sempre em português do Brasil.`,

  explain_question: `Você é um professor especializado em explicar questões de concursos públicos.
Ao explicar uma questão, você deve:
1. Analisar cada alternativa individualmente
2. Explicar por que a correta está certa (com fundamentação legal/doutrinária)
3. Explicar por que as incorretas estão erradas
4. Identificar "pegadinhas" típicas da banca
5. Citar artigos de lei, súmulas ou jurisprudência quando aplicável
6. Dar dicas de como identificar questões semelhantes
Responda sempre em português do Brasil.`,

  create_flashcards: `Você é um especialista em criar flashcards para memorização de conteúdo de concursos.
Crie flashcards no formato JSON array com a estrutura:
[
  { "frente": "pergunta ou conceito", "verso": "resposta ou explicação" }
]
Os flashcards devem:
- Focar nos pontos mais cobrados
- Ser objetivos e diretos
- Incluir artigos de lei quando relevante
- Usar linguagem clara
Retorne APENAS o JSON, sem texto adicional.`,

  create_questions: `Você é um especialista em criar questões de concurso no estilo das principais bancas brasileiras.
Crie questões no formato JSON array com a estrutura:
[
  {
    "enunciado": "texto da questão",
    "alternativa_a": "opção A",
    "alternativa_b": "opção B", 
    "alternativa_c": "opção C",
    "alternativa_d": "opção D",
    "alternativa_e": "opção E (pode ser vazio para CESPE)",
    "gabarito": "A/B/C/D/E ou CERTO/ERRADO",
    "explicacao": "explicação detalhada",
    "dificuldade": "facil/medio/dificil"
  }
]
As questões devem:
- Ter pegadinhas realistas da banca especificada
- Basear-se em legislação e jurisprudência atualizadas
- Ter explicações detalhadas
Retorne APENAS o JSON, sem texto adicional.`
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, text, question, answer, banca, topic, content }: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = systemPrompts[action] || systemPrompts.chat;
    let userMessage = "";

    switch (action) {
      case "chat":
        // Messages are passed directly
        break;
      case "summary":
        userMessage = `Crie um resumo didático do seguinte conteúdo para estudo de concursos:\n\n${text}`;
        break;
      case "explain_question":
        userMessage = `Explique detalhadamente a seguinte questão${banca ? ` da banca ${banca}` : ''}:\n\nQuestão: ${question}\n\nGabarito: ${answer}\n\nExplique cada alternativa e por que a resposta correta está certa.`;
        break;
      case "create_flashcards":
        userMessage = `Crie 10 flashcards para memorização sobre o seguinte conteúdo:\n\n${content}`;
        break;
      case "create_questions":
        userMessage = `Crie 5 questões no estilo da banca ${banca || 'CESPE'} sobre o tema: ${topic}. Se for CESPE, use formato Certo/Errado.`;
        break;
    }

    const apiMessages = action === "chat" 
      ? [{ role: "system", content: systemPrompt }, ...(messages || [])]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns instantes." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
