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
  | "create_questions"
  | "mind_map";

interface AIRequest {
  action: AIAction;
  messages?: Array<{ role: string; content: string }>;
  text?: string;
  question?: string;
  answer?: string;
  banca?: string;
  topic?: string;
  content?: string;
  studentContext?: {
    concurso?: string;
    cargo?: string;
    disciplinas?: string[];
    pontosFracos?: string[];
  };
}

const getSystemPrompt = (action: AIAction, studentContext?: AIRequest['studentContext']): string => {
  const contextInfo = studentContext 
    ? `\n\nContexto do aluno:
- Concurso alvo: ${studentContext.concurso || 'Não especificado'}
- Cargo: ${studentContext.cargo || 'Não especificado'}
- Disciplinas foco: ${studentContext.disciplinas?.join(', ') || 'Não especificado'}
- Pontos a melhorar: ${studentContext.pontosFracos?.join(', ') || 'Não especificado'}`
    : '';

  const prompts: Record<AIAction, string> = {
    chat: `Você é um assistente especializado em concursos públicos brasileiros com vasto conhecimento em:

📚 **Áreas de Conhecimento:**
- Direito: Constitucional, Administrativo, Civil, Penal, Trabalhista, Tributário, Processual
- Português: Gramática, Interpretação de Texto, Redação Oficial
- Raciocínio Lógico e Matemática
- Informática e Tecnologia
- Conhecimentos Específicos por área

🏛️ **Bancas Examinadoras:**
CESPE/CEBRASPE, FCC, FGV, VUNESP, IBFC, IDECAN, IADES, Quadrix, entre outras

📖 **Legislação e Jurisprudência:**
- Constituição Federal atualizada
- Leis Complementares e Ordinárias
- Súmulas Vinculantes e do STF/STJ
- Jurisprudência relevante

**Diretrizes:**
1. Seja didático e use linguagem clara
2. Cite artigos de lei e jurisprudência quando relevante
3. Use exemplos práticos para facilitar o entendimento
4. Identifique pegadinhas comuns das bancas
5. Sugira técnicas de memorização quando apropriado
6. Responda sempre em português do Brasil
7. Use formatação markdown para organizar as respostas${contextInfo}`,

    summary: `Você é um especialista em criar resumos didáticos para concursos públicos.

**Ao resumir, você deve:**
1. ✅ Destacar os pontos mais cobrados em provas
2. ✅ Usar bullet points e estrutura hierárquica clara
3. ✅ Incluir macetes e técnicas de memorização
4. ✅ Citar artigos de lei com precisão
5. ✅ Destacar jurisprudência importante (STF/STJ)
6. ✅ Usar formatação markdown
7. ✅ Criar boxes de "Atenção" para pegadinhas

**Estrutura ideal:**
- Introdução breve
- Tópicos principais numerados
- Subtópicos com bullets
- Quadro de memorização
- Pontos de atenção

Responda sempre em português do Brasil.${contextInfo}`,

    explain_question: `Você é um professor especializado em explicar questões de concursos públicos.

**Ao explicar uma questão, siga esta estrutura:**

## 1. Identificação do Tema
- Assunto principal
- Disciplina relacionada
- Dificuldade estimada

## 2. Análise do Enunciado
- Contexto da questão
- O que está sendo perguntado

## 3. Análise de Cada Alternativa
Para cada opção:
- ✅ **Correta:** Explique o fundamento legal/doutrinário
- ❌ **Incorretas:** Explique o erro e a confusão pretendida

## 4. Fundamentação
- Artigos de lei relevantes
- Súmulas aplicáveis
- Jurisprudência (se houver)

## 5. Dicas para Questões Similares
- Padrões da banca
- Pegadinhas típicas
- Como identificar a resposta correta

Responda sempre em português do Brasil.${contextInfo}`,

    create_flashcards: `Você é um especialista em criar flashcards eficientes para memorização de conteúdo de concursos.

**Retorne APENAS um JSON array** com a seguinte estrutura:
[
  {
    "frente": "Pergunta clara e objetiva",
    "verso": "Resposta concisa com os pontos essenciais"
  }
]

**Diretrizes para os flashcards:**
1. Perguntas diretas e específicas
2. Respostas objetivas (máximo 3-4 linhas)
3. Incluir artigos de lei quando relevante
4. Focar nos pontos mais cobrados
5. Usar linguagem simples e direta
6. Evitar ambiguidades
7. Incluir macetes quando possível

**Quantidade:** Crie entre 8 e 12 flashcards por tema.

⚠️ **IMPORTANTE:** Retorne APENAS o JSON, sem texto adicional, sem markdown code blocks.${contextInfo}`,

    create_questions: `Você é um especialista em criar questões de concurso no estilo das principais bancas brasileiras.

**Retorne APENAS um JSON array** com a estrutura:
[
  {
    "enunciado": "Texto completo da questão",
    "alternativa_a": "Opção A",
    "alternativa_b": "Opção B",
    "alternativa_c": "Opção C",
    "alternativa_d": "Opção D",
    "alternativa_e": "Opção E (ou vazio para CESPE Certo/Errado)",
    "gabarito": "A/B/C/D/E ou CERTO/ERRADO",
    "explicacao": "Explicação detalhada com fundamentação legal",
    "dificuldade": "facil/medio/dificil"
  }
]

**Diretrizes:**
1. Questões com pegadinhas realistas da banca especificada
2. Baseadas em legislação e jurisprudência atualizadas
3. Alternativas com distratores inteligentes
4. Explicações com citação de artigos/súmulas
5. Para CESPE: formato Certo/Errado
6. Para FCC/FGV: 5 alternativas

⚠️ **IMPORTANTE:** Retorne APENAS o JSON, sem texto adicional, sem markdown code blocks.${contextInfo}`,

    mind_map: `Você é um especialista em criar mapas mentais estruturados para concursos.

**Estruture o mapa mental assim:**

# 🎯 [TEMA CENTRAL]

## 📌 Tópico Principal 1
### Subtópico 1.1
- Ponto importante
- Ponto importante
### Subtópico 1.2
- Ponto importante

## 📌 Tópico Principal 2
### Subtópico 2.1
- Ponto importante
### Subtópico 2.2
- Ponto importante

## ⚠️ Pegadinhas Comuns
- Item 1
- Item 2

## 💡 Dicas de Memorização
- Macete 1
- Macete 2

## 📚 Legislação Relevante
- Art. X da Lei Y
- Súmula Z

Use emojis para facilitar a visualização e hierarquia clara com markdown.${contextInfo}`
  };

  return prompts[action] || prompts.chat;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, messages, text, question, answer, banca, topic, content, studentContext }: AIRequest = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getSystemPrompt(action, studentContext);
    let userMessage = "";

    switch (action) {
      case "chat":
        // Messages are passed directly
        break;
      case "summary":
        userMessage = `Crie um resumo didático e completo do seguinte conteúdo para estudo de concursos públicos:\n\n${text}`;
        break;
      case "explain_question":
        userMessage = `Explique detalhadamente a seguinte questão${banca ? ` da banca ${banca}` : ''}:\n\n**Questão:**\n${question}\n\n**Gabarito:** ${answer}\n\nAnalise cada alternativa e explique por que a resposta correta está certa e as demais estão erradas.`;
        break;
      case "create_flashcards":
        userMessage = `Crie flashcards de alta qualidade para memorização sobre o seguinte conteúdo:\n\n${content}\n\nRetorne APENAS o JSON array, sem texto adicional.`;
        break;
      case "create_questions":
        userMessage = `Crie 5 questões desafiadoras no estilo da banca ${banca || 'CESPE'} sobre o tema: "${topic}".\n\n${banca === 'CESPE' ? 'Use o formato Certo/Errado característico do CESPE.' : 'Use 5 alternativas (A, B, C, D, E).'}\n\nRetorne APENAS o JSON array, sem texto adicional.`;
        break;
      case "mind_map":
        userMessage = `Crie um mapa mental completo e estruturado sobre: ${content}\n\nUse hierarquia clara com headers markdown e emojis para facilitar a visualização.`;
        break;
    }

    const apiMessages = action === "chat" 
      ? [{ role: "system", content: systemPrompt }, ...(messages || [])]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ];

    console.log(`Processing ${action} request...`);

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
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorStatus = response.status;
      const errorText = await response.text();
      console.error(`AI gateway error: ${errorStatus}`, errorText);

      if (errorStatus === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos e tente novamente." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorStatus === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Entre em contato com o suporte para continuar usando." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação. Tente novamente." }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente." }), 
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});