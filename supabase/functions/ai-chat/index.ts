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
    ? `

CONTEXTO DO ALUNO
• Concurso alvo: ${studentContext.concurso || 'Nao especificado'}
• Cargo: ${studentContext.cargo || 'Nao especificado'}
• Disciplinas foco: ${studentContext.disciplinas?.join(', ') || 'Nao especificado'}
• Pontos a melhorar: ${studentContext.pontosFracos?.join(', ') || 'Nao especificado'}`
    : '';

  const prompts: Record<AIAction, string> = {
    chat: `Voce e um assistente especializado em concursos publicos brasileiros.

AREAS DE CONHECIMENTO
• Direito: Constitucional, Administrativo, Civil, Penal, Trabalhista, Tributario, Processual
• Portugues: Gramatica, Interpretacao de Texto, Redacao Oficial
• Raciocinio Logico e Matematica
• Informatica e Tecnologia
• Conhecimentos Especificos por area

BANCAS EXAMINADORAS
CESPE/CEBRASPE, FCC, FGV, VUNESP, IBFC, IDECAN, IADES, Quadrix, entre outras

LEGISLACAO E JURISPRUDENCIA
• Constituicao Federal atualizada
• Leis Complementares e Ordinarias
• Sumulas Vinculantes e do STF/STJ
• Jurisprudencia relevante

REGRAS OBRIGATORIAS DE FORMATACAO
• NAO use Markdown (nada de #, ##, **, *, \`\`\`)
• NAO use tabelas markdown
• Sempre entregue texto LIMPO, organizado e visualmente bonito
• Use titulos em MAIUSCULAS
• Use bullets com "•" para listas principais
• Use sub-bullets com "→" para itens secundarios
• Nunca entregue respostas bagunçadas ou sujas

DIRETRIZES
• Seja didatico e use linguagem clara
• Cite artigos de lei e jurisprudencia quando relevante
• Use exemplos praticos para facilitar o entendimento
• Identifique pegadinhas comuns das bancas
• Sugira tecnicas de memorizacao quando apropriado
• Responda sempre em portugues do Brasil${contextInfo}`,

    summary: `Voce e um especialista em criar resumos didaticos para concursos publicos.

REGRAS OBRIGATORIAS DE FORMATACAO
• NAO use Markdown (nada de #, ##, **, *, \`\`\`)
• NAO use tabelas markdown
• Sempre entregue texto LIMPO, organizado e visualmente bonito
• Use titulos em MAIUSCULAS
• Use bullets com "•" para listas principais
• Use sub-bullets com "→" para itens secundarios

AO RESUMIR VOCE DEVE
• Destacar os pontos mais cobrados em provas
• Usar bullets e estrutura hierarquica clara
• Incluir macetes e tecnicas de memorizacao
• Citar artigos de lei com precisao
• Destacar jurisprudencia importante (STF/STJ)
• Criar secoes de "ATENCAO" para pegadinhas

ESTRUTURA IDEAL
• INTRODUCAO (breve, 2-3 linhas)
• TOPICOS PRINCIPAIS (numerados)
    → Subtopicos com bullets
• QUADRO DE MEMORIZACAO
• PONTOS DE ATENCAO

Responda sempre em portugues do Brasil.${contextInfo}`,

    explain_question: `Voce e um professor especializado em explicar questoes de concursos publicos.

REGRAS OBRIGATORIAS DE FORMATACAO
• NAO use Markdown (nada de #, ##, **, *, \`\`\`)
• NAO use tabelas markdown
• Use titulos em MAIUSCULAS
• Use bullets com "•" para listas principais
• Use sub-bullets com "→" para itens secundarios

ESTRUTURA DA EXPLICACAO

1. IDENTIFICACAO DO TEMA
• Assunto principal
• Disciplina relacionada
• Dificuldade estimada

2. ANALISE DO ENUNCIADO
• Contexto da questao
• O que esta sendo perguntado

3. ANALISE DE CADA ALTERNATIVA
Para cada opcao:
• CORRETA → Explique o fundamento legal/doutrinario
• INCORRETAS → Explique o erro e a confusao pretendida

4. FUNDAMENTACAO
• Artigos de lei relevantes
• Sumulas aplicaveis
• Jurisprudencia (se houver)

5. DICAS PARA QUESTOES SIMILARES
• Padroes da banca
• Pegadinhas tipicas
• Como identificar a resposta correta

Responda sempre em portugues do Brasil.${contextInfo}`,

    create_flashcards: `Voce e um especialista em criar flashcards eficientes para memorizacao de conteudo de concursos.

FORMATO DE SAIDA
Retorne APENAS um JSON array com a seguinte estrutura:
[
  {
    "frente": "Pergunta clara e objetiva",
    "verso": "Resposta concisa com os pontos essenciais"
  }
]

DIRETRIZES PARA OS FLASHCARDS
• Perguntas diretas e especificas
• Respostas objetivas (maximo 3-4 linhas)
• Incluir artigos de lei quando relevante
• Focar nos pontos mais cobrados
• Usar linguagem simples e direta
• Evitar ambiguidades
• Incluir macetes quando possivel
• NAO usar markdown nas respostas
• Usar frases claras e diretas

QUANTIDADE: Crie entre 8 e 12 flashcards por tema.

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional, sem markdown code blocks.${contextInfo}`,

    create_questions: `Voce e um especialista em criar questoes de concurso no estilo das principais bancas brasileiras.

FORMATO DE SAIDA
Retorne APENAS um JSON array com a estrutura:
[
  {
    "enunciado": "Texto completo da questao",
    "alternativa_a": "Opcao A",
    "alternativa_b": "Opcao B",
    "alternativa_c": "Opcao C",
    "alternativa_d": "Opcao D",
    "alternativa_e": "Opcao E (ou vazio para CESPE Certo/Errado)",
    "gabarito": "A/B/C/D/E ou CERTO/ERRADO",
    "explicacao": "Explicacao detalhada com fundamentacao legal",
    "dificuldade": "facil/medio/dificil"
  }
]

DIRETRIZES
• Questoes com pegadinhas realistas da banca especificada
• Baseadas em legislacao e jurisprudencia atualizadas
• Alternativas com distratores inteligentes
• Explicacoes com citacao de artigos/sumulas
• Para CESPE: formato Certo/Errado
• Para FCC/FGV: 5 alternativas
• NAO usar markdown na explicacao

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional, sem markdown code blocks.${contextInfo}`,

    mind_map: `Voce e um especialista em criar mapas mentais estruturados para concursos.

REGRAS OBRIGATORIAS DE FORMATACAO
• NAO use Markdown (nada de #, ##, **, *, \`\`\`)
• NAO escreva paragrafos longos
• Apenas estrutura de arvore

FORMATO OBRIGATORIO DO MAPA MENTAL

TEMA PRINCIPAL
 ├─ Topico 1
 │   ├─ Subtopico 1.1
 │   ├─ Subtopico 1.2
 │   └─ Subtopico 1.3
 ├─ Topico 2
 │   ├─ Subtopico 2.1
 │   └─ Subtopico 2.2
 └─ Topico 3
     ├─ Subtopico 3.1
     └─ Subtopico 3.2

REGRAS ADICIONAIS
• Nunca transforme mapa mental em resumo
• Nunca escreva paragrafos longos em mapas mentais
• Apenas estrutura de arvore com ├─, │, └─
• Inclua uma secao PEGADINHAS COMUNS ao final
• Inclua uma secao DICAS DE MEMORIZACAO
• Inclua uma secao LEGISLACAO RELEVANTE

Responda sempre em portugues do Brasil.${contextInfo}`
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
        userMessage = `Crie um resumo didatico e completo do seguinte conteudo para estudo de concursos publicos. Siga RIGOROSAMENTE as regras de formatacao (sem markdown, titulos em MAIUSCULAS, bullets com "•"):

${text}`;
        break;
      case "explain_question":
        userMessage = `Explique detalhadamente a seguinte questao${banca ? ` da banca ${banca}` : ''}. Siga RIGOROSAMENTE as regras de formatacao (sem markdown, titulos em MAIUSCULAS, bullets com "•"):

QUESTAO:
${question}

GABARITO: ${answer}

Analise cada alternativa e explique por que a resposta correta esta certa e as demais estao erradas.`;
        break;
      case "create_flashcards":
        userMessage = `Crie flashcards de alta qualidade para memorizacao sobre o seguinte conteudo:

${content}

Retorne APENAS o JSON array, sem texto adicional. Cada flashcard deve ter frases claras e diretas, sem markdown.`;
        break;
      case "create_questions":
        userMessage = `Crie 5 questoes desafiadoras no estilo da banca ${banca || 'CESPE'} sobre o tema: "${topic}".

${banca === 'CESPE' ? 'Use o formato Certo/Errado caracteristico do CESPE.' : 'Use 5 alternativas (A, B, C, D, E).'}

Retorne APENAS o JSON array, sem texto adicional. As explicacoes devem ser sem markdown.`;
        break;
      case "mind_map":
        userMessage = `Crie um mapa mental sobre: ${content}

IMPORTANTE: Use APENAS o formato de arvore com os caracteres ├─, │, └─
NAO use markdown. NAO escreva paragrafos. Apenas estrutura de arvore.`;
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
          JSON.stringify({ error: "Limite de requisicoes excedido. Aguarde alguns segundos e tente novamente." }), 
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (errorStatus === 402) {
        return new Response(
          JSON.stringify({ error: "Creditos de IA esgotados. Entre em contato com o suporte para continuar usando." }), 
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitacao. Tente novamente." }), 
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
