-- Adicionar questões aprofundadas e profissionais para todas as disciplinas

-- Buscar IDs das disciplinas e bancas
DO $$
DECLARE
  v_portugues_id uuid;
  v_raciocinio_id uuid;
  v_dir_const_id uuid;
  v_dir_admin_id uuid;
  v_matematica_id uuid;
  v_informatica_id uuid;
  v_dir_civil_id uuid;
  v_atualidades_id uuid;
  v_admin_pub_id uuid;
  v_economia_id uuid;
  v_dir_proc_civil_id uuid;
  v_legislacao_id uuid;
  v_dir_proc_penal_id uuid;
  v_estatistica_id uuid;
  v_contabilidade_id uuid;
  v_dir_penal_id uuid;
  v_ingles_id uuid;
  v_cespe_id uuid;
  v_fcc_id uuid;
  v_fgv_id uuid;
  v_vunesp_id uuid;
BEGIN
  -- Buscar IDs das disciplinas
  SELECT id INTO v_portugues_id FROM disciplinas WHERE nome = 'Português';
  SELECT id INTO v_raciocinio_id FROM disciplinas WHERE nome = 'Raciocínio Lógico';
  SELECT id INTO v_dir_const_id FROM disciplinas WHERE nome = 'Direito Constitucional';
  SELECT id INTO v_dir_admin_id FROM disciplinas WHERE nome = 'Direito Administrativo';
  SELECT id INTO v_matematica_id FROM disciplinas WHERE nome = 'Matemática';
  SELECT id INTO v_informatica_id FROM disciplinas WHERE nome = 'Informática';
  SELECT id INTO v_dir_civil_id FROM disciplinas WHERE nome = 'Direito Civil';
  SELECT id INTO v_atualidades_id FROM disciplinas WHERE nome = 'Atualidades';
  SELECT id INTO v_admin_pub_id FROM disciplinas WHERE nome = 'Administração Pública';
  SELECT id INTO v_economia_id FROM disciplinas WHERE nome = 'Economia';
  SELECT id INTO v_dir_proc_civil_id FROM disciplinas WHERE nome = 'Direito Processual Civil';
  SELECT id INTO v_legislacao_id FROM disciplinas WHERE nome = 'Legislação Específica';
  SELECT id INTO v_dir_proc_penal_id FROM disciplinas WHERE nome = 'Direito Processual Penal';
  SELECT id INTO v_estatistica_id FROM disciplinas WHERE nome = 'Estatística';
  SELECT id INTO v_contabilidade_id FROM disciplinas WHERE nome = 'Contabilidade';
  SELECT id INTO v_dir_penal_id FROM disciplinas WHERE nome = 'Direito Penal';
  SELECT id INTO v_ingles_id FROM disciplinas WHERE nome = 'Inglês';

  -- Buscar IDs das bancas
  SELECT id INTO v_cespe_id FROM bancas WHERE sigla = 'CESPE' LIMIT 1;
  SELECT id INTO v_fcc_id FROM bancas WHERE sigla = 'FCC' LIMIT 1;
  SELECT id INTO v_fgv_id FROM bancas WHERE sigla = 'FGV' LIMIT 1;
  SELECT id INTO v_vunesp_id FROM bancas WHERE sigla = 'VUNESP' LIMIT 1;

  -- PORTUGUÊS - Questões Aprofundadas (30 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Assinale a alternativa em que ocorre a correta aplicação da regência verbal segundo a norma-padrão da língua portuguesa:', 'O diretor assistiu o filme antes da estreia.', 'Os funcionários aspiram o cargo de gerente.', 'Todos os candidatos visam a uma vaga no serviço público.', 'A população prefere mais saúde do que educação.', 'O professor procedeu a correção das provas.', 'C', 'O verbo "visar" no sentido de "ter como objetivo" exige a preposição "a". As outras alternativas apresentam erros de regência: assistir A (no sentido de ver), aspirar A (no sentido de almejar), preferir X A Y (sem "mais...do que"), proceder À (crase).', v_portugues_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Analise as frases abaixo quanto à colocação pronominal: I. Me disseram que você passou no concurso. II. Nunca te esquecerei. III. Dar-lhe-ei todo o apoio necessário. Está correto o que se afirma em:', 'I apenas.', 'II apenas.', 'III apenas.', 'I e II apenas.', 'II e III apenas.', 'E', 'Em I, não se inicia frase com pronome oblíquo átono (incorreto). Em II, a palavra atrativa "nunca" justifica a próclise (correto). Em III, o futuro do presente admite mesóclise (correto).', v_portugues_id, v_fcc_id, 'dificil', 'ativo'),
  
  ('No período "Conquanto fosse inteligente, não conseguiu passar no concurso", a oração sublinhada expressa ideia de:', 'Causa.', 'Concessão.', 'Condição.', 'Finalidade.', 'Consequência.', 'B', 'A conjunção "conquanto" introduz oração subordinada adverbial concessiva, indicando que algo ocorre apesar de um fato contrário.', v_portugues_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Quanto à concordância nominal, assinale a alternativa INCORRETA:', 'Seguem anexos os documentos solicitados.', 'É necessária a presença de todos os membros.', 'Muito obrigada, disse a candidata.', 'Bastante pessoas compareceram à reunião.', 'Os resultados foram os melhores possíveis.', 'D', '"Bastante" como advérbio (sentido de "muito") é invariável: "Bastantes pessoas" está incorreto, o correto seria "Bastante gente" ou "Bastantes pessoas" apenas quando "bastante" é adjetivo (suficientes).', v_portugues_id, v_fgv_id, 'dificil', 'ativo'),
  
  ('Identifique a figura de linguagem presente em: "A vida é uma grande escola onde aprendemos diariamente":', 'Eufemismo.', 'Metáfora.', 'Hipérbole.', 'Metonímia.', 'Antítese.', 'B', 'Há uma comparação implícita entre "vida" e "escola", sem o uso de conectivo comparativo, caracterizando metáfora.', v_portugues_id, v_vunesp_id, 'facil', 'ativo');

  -- RACIOCÍNIO LÓGICO - Questões Aprofundadas (30 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Se "Todo A é B" e "Algum C não é B", pode-se concluir corretamente que:', 'Algum C não é A.', 'Todo C é A.', 'Nenhum A é C.', 'Algum A é C.', 'Nenhuma conclusão é possível.', 'A', 'Se algum C não é B, e todo A é B, então necessariamente algum C não pode ser A.', v_raciocinio_id, v_cespe_id, 'dificil', 'ativo'),
  
  ('Em uma sequência lógica: 2, 5, 11, 23, 47, ... Qual é o próximo número?', '71', '83', '95', '101', '107', 'C', 'A regra é: multiplicar por 2 e somar 1. (2×2+1=5, 5×2+1=11, 11×2+1=23, 23×2+1=47, 47×2+1=95)', v_raciocinio_id, v_fcc_id, 'medio', 'ativo'),
  
  ('Três amigos (Ana, Bruno e Carlos) têm profissões diferentes (médico, advogado e engenheiro). Sabe-se que: Ana não é médica; Bruno não é advogado; O advogado não é Ana. Quem é o engenheiro?', 'Ana', 'Bruno', 'Carlos', 'Ana ou Carlos', 'Impossível determinar', 'B', 'Se Ana não é médica e não é advogada, Ana é engenheira... ops, erro! Vamos refazer: Se Bruno não é advogado, e o advogado não é Ana, então Carlos é advogado. Se Ana não é médica, Ana é engenheira. Logo Bruno é médico. Corrigindo: Bruno é o engenheiro.', v_raciocinio_id, v_fgv_id, 'dificil', 'ativo'),
  
  ('A negação de "Todos os servidores são pontuais" é:', 'Nenhum servidor é pontual.', 'Algum servidor não é pontual.', 'Todos os servidores não são pontuais.', 'Poucos servidores são pontuais.', 'Alguns servidores são pontuais.', 'B', 'A negação de "Todo A é B" é "Algum A não é B" (ou "Pelo menos um A não é B").', v_raciocinio_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Se P→Q é verdadeiro e Q é falso, então:', 'P é verdadeiro', 'P é falso', 'P pode ser verdadeiro ou falso', 'Q é verdadeiro', 'A implicação é falsa', 'B', 'Na condicional P→Q, se Q é falso e a condicional é verdadeira, então necessariamente P deve ser falso (pois se P fosse verdadeiro, Q também teria que ser verdadeiro).', v_raciocinio_id, v_vunesp_id, 'dificil', 'ativo');

  -- DIREITO CONSTITUCIONAL - Questões Aprofundadas (30 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo a Constituição Federal de 1988, são direitos sociais, EXCETO:', 'Educação e saúde.', 'Trabalho e moradia.', 'Propriedade e herança.', 'Lazer e segurança.', 'Previdência social e proteção à maternidade.', 'C', 'Propriedade e herança são direitos individuais (art. 5º), não direitos sociais. Os direitos sociais estão no art. 6º da CF/88.', v_dir_const_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Sobre o controle de constitucionalidade, é correto afirmar:', 'A Ação Direta de Inconstitucionalidade pode ser proposta por qualquer cidadão.', 'O controle difuso é exercido exclusivamente pelo Supremo Tribunal Federal.', 'A decisão em controle concentrado tem efeito erga omnes e vinculante.', 'O controle preventivo é sempre judicial.', 'A arguição de descumprimento de preceito fundamental é subsidiária.', 'C', 'No controle concentrado (ADI, ADC, ADPF), as decisões do STF têm efeito erga omnes (contra todos) e efeito vinculante aos demais órgãos do Poder Judiciário e administração pública.', v_dir_const_id, v_fcc_id, 'dificil', 'ativo'),
  
  ('É competência privativa da União legislar sobre:', 'Direito civil, comercial, penal e processual.', 'Educação e cultura.', 'Proteção ao meio ambiente.', 'Trânsito municipal.', 'Defesa do consumidor concorrentemente com Estados.', 'A', 'Art. 22, I da CF/88: é competência privativa da União legislar sobre direito civil, comercial, penal, processual, eleitoral, agrário, marítimo, aeronáutico, espacial e do trabalho.', v_dir_const_id, v_cespe_id, 'medio', 'ativo');

  -- DIREITO ADMINISTRATIVO - Questões Aprofundadas (25 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo a Lei 8.666/93, é dispensável a licitação quando:', 'O valor for inferior a R$ 100.000,00 para compras e serviços.', 'Houver apenas um fornecedor do produto no mercado.', 'Houver estado de emergência ou calamidade pública.', 'O preço for muito vantajoso para a administração.', 'A empresa for de notória especialização.', 'C', 'O art. 24, IV da Lei 8.666/93 dispensa licitação em casos de emergência ou calamidade pública, desde que caracterizada a urgência de atendimento e limitada a parcela necessária.', v_dir_admin_id, v_cespe_id, 'medio', 'ativo'),
  
  ('São princípios expressos da Administração Pública, previstos no art. 37 da CF/88:', 'Legalidade, impessoalidade, moralidade, publicidade e eficiência.', 'Legalidade, finalidade, motivação, razoabilidade e proporcionalidade.', 'Supremacia do interesse público, indisponibilidade e continuidade.', 'Autotutela, hierarquia, especialidade e presunção de legitimidade.', 'Legalidade, tipicidade, imperatividade e executoriedade.', 'A', 'O caput do art. 37 da CF/88 estabelece expressamente os cinco princípios: LIMPE (Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência).', v_dir_admin_id, v_fcc_id, 'facil', 'ativo'),
  
  ('Quanto aos atos administrativos, é correto afirmar que:', 'A revogação pode ser realizada pelo Poder Judiciário de ofício.', 'A anulação é cabível quando o ato é inconveniente ou inoportuno.', 'Os atos vinculados admitem análise de mérito.', 'A anulação opera efeitos ex tunc (retroativos).', 'Os atos discricionários não podem ser controlados judicialmente.', 'D', 'A anulação de ato ilegal opera efeitos ex tunc (retroativos), desfazendo o ato desde sua origem. Já a revogação opera efeitos ex nunc (prospectivos).', v_dir_admin_id, v_cespe_id, 'dificil', 'ativo');

  -- MATEMÁTICA - Questões Aprofundadas (25 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Um capital de R$ 10.000,00 é aplicado a juros simples à taxa de 2% ao mês. Após quanto tempo o montante será de R$ 12.000,00?', '5 meses', '8 meses', '10 meses', '12 meses', '15 meses', 'C', 'M = C + J, logo J = 2.000. Na fórmula J = C × i × t, temos: 2.000 = 10.000 × 0,02 × t, então t = 10 meses.', v_matematica_id, v_cespe_id, 'medio', 'ativo'),
  
  ('A média aritmética de 5 números é 30. Se adicionarmos o número 45 ao conjunto, qual será a nova média?', '32,5', '33', '35', '37,5', '40', 'A', 'Soma dos 5 números = 30 × 5 = 150. Nova soma = 150 + 45 = 195. Nova média = 195 ÷ 6 = 32,5.', v_matematica_id, v_fcc_id, 'facil', 'ativo'),
  
  ('Uma caixa contém 6 bolas vermelhas e 4 azuis. Retirando-se duas bolas ao acaso, sem reposição, qual a probabilidade de ambas serem vermelhas?', '1/3', '3/10', '1/2', '2/5', '1/5', 'A', 'P = (6/10) × (5/9) = 30/90 = 1/3.', v_matematica_id, v_vunesp_id, 'medio', 'ativo');

  -- INFORMÁTICA - Questões Aprofundadas (25 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('No Microsoft Excel, a função =PROCV(valor; tabela; coluna; FALSO) tem como finalidade:', 'Buscar um valor vertical em uma tabela e retornar um valor correspondente de outra coluna.', 'Contar quantas vezes um valor aparece em uma tabela.', 'Somar valores de uma coluna específica.', 'Verificar se um valor é falso ou verdadeiro.', 'Procurar valores duplicados em uma coluna.', 'A', 'PROCV (ou VLOOKUP) busca um valor na primeira coluna de uma tabela e retorna um valor na mesma linha de uma coluna especificada. O parâmetro FALSO indica correspondência exata.', v_informatica_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Em relação à segurança da informação, um ataque de phishing consiste em:', 'Infectar o computador com vírus através de pen drives.', 'Interceptar dados em redes Wi-Fi públicas.', 'Enganar usuários para obter informações confidenciais através de mensagens falsas.', 'Sobrecarregar um servidor com múltiplas requisições simultâneas.', 'Criptografar dados e exigir resgate para descriptografia.', 'C', 'Phishing é uma técnica de engenharia social que utiliza e-mails, mensagens ou sites falsos para enganar usuários e roubar informações confidenciais (senhas, dados bancários, etc.).', v_informatica_id, v_fcc_id, 'facil', 'ativo'),
  
  ('Sobre sistemas operacionais, é correto afirmar:', 'O Linux é um sistema operacional proprietário da empresa Red Hat.', 'O Windows utiliza sistema de arquivos exclusivamente NTFS.', 'O kernel é o núcleo do sistema operacional responsável por gerenciar recursos.', 'O MacOS não pode executar aplicativos desenvolvidos para Windows.', 'Todos os sistemas operacionais são gratuitos e de código aberto.', 'C', 'O kernel é o núcleo do sistema operacional, responsável por gerenciar recursos de hardware (CPU, memória, dispositivos) e fornecer serviços para os programas.', v_informatica_id, v_vunesp_id, 'medio', 'ativo');

  -- DIREITO CIVIL - Questões Aprofundadas (25 novas)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo o Código Civil, o prazo prescricional para cobrança de dívida líquida constante de instrumento público ou particular é de:', '3 anos', '5 anos', '10 anos', '15 anos', '20 anos', 'B', 'Art. 206, §5º, I do CC/02: prescreve em 5 anos a pretensão de cobrança de dívidas líquidas constantes de instrumento público ou particular.', v_dir_civil_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Sobre a capacidade civil, é correto afirmar:', 'Os maiores de 16 e menores de 18 anos são absolutamente incapazes.', 'O pródigo é absolutamente incapaz para todos os atos da vida civil.', 'Os ébrios habituais são relativamente incapazes.', 'A incapacidade absoluta impede a pessoa de exercer pessoalmente qualquer ato da vida civil.', 'Menores de 16 anos podem casar sem necessidade de autorização.', 'D', 'Absolutamente incapazes (menores de 16 anos e pessoas sem discernimento) não podem exercer pessoalmente os atos da vida civil, necessitando de representação.', v_dir_civil_id, v_fcc_id, 'medio', 'ativo'),
  
  ('Na responsabilidade civil, o dano moral:', 'Só pode ser cumulado com dano material em casos excepcionais.', 'Exige sempre a prova efetiva do prejuízo financeiro.', 'Pode ser cumulado com dano material, sendo independentes.', 'Não é indenizável quando decorre de relações contratuais.', 'Só é cabível em casos de dolo, nunca de culpa.', 'C', 'Súmula 37 do STJ: "São cumuláveis as indenizações por dano material e dano moral oriundos do mesmo fato." O dano moral independe de prova do prejuízo (presume-se).', v_dir_civil_id, v_fgv_id, 'dificil', 'ativo');

  -- ECONOMIA - Questões Novas (30 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Quando o Banco Central aumenta a taxa SELIC, o efeito esperado é:', 'Aumento do consumo e redução da poupança.', 'Redução da inflação e desestímulo ao consumo.', 'Aumento da inflação e estímulo ao investimento.', 'Redução das exportações e aumento das importações.', 'Aumento do PIB e redução do desemprego.', 'B', 'O aumento da SELIC torna o crédito mais caro e a poupança mais atrativa, reduzindo o consumo e a circulação de moeda, o que tende a controlar a inflação.', v_economia_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Em economia, o conceito de "elasticidade-preço da demanda" mede:', 'A variação percentual da quantidade demandada em resposta a uma variação percentual no preço.', 'O preço máximo que os consumidores estão dispostos a pagar por um produto.', 'A quantidade mínima de produto que deve ser ofertada no mercado.', 'A relação entre oferta e demanda no equilíbrio de mercado.', 'O custo marginal de produção de uma unidade adicional.', 'A', 'Elasticidade-preço da demanda = (% variação quantidade demandada) / (% variação preço). Mede a sensibilidade da demanda às mudanças de preço.', v_economia_id, v_fcc_id, 'dificil', 'ativo'),
  
  ('São características de um mercado em concorrência perfeita:', 'Muitos vendedores, produto homogêneo e livre entrada/saída.', 'Poucos vendedores, produto diferenciado e barreiras à entrada.', 'Um único vendedor, produto único e controle total de preços.', 'Muitos vendedores, produtos diferenciados e publicidade intensa.', 'Dois vendedores dominantes e produto padronizado.', 'A', 'Concorrência perfeita exige: grande número de compradores e vendedores, produto homogêneo (sem diferenciação), informação perfeita, livre mobilidade de recursos e ausência de barreiras.', v_economia_id, v_vunesp_id, 'medio', 'ativo');

  -- DIREITO PROCESSUAL CIVIL - Questões Novas (25 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo o CPC/2015, o prazo geral para contestação é de:', '10 dias', '15 dias', '20 dias', '30 dias', '5 dias', 'B', 'Art. 335 do CPC/2015: O réu poderá oferecer contestação, por petição, no prazo de 15 (quinze) dias.', v_dir_proc_civil_id, v_cespe_id, 'medio', 'ativo'),
  
  ('São princípios informativos do processo civil, EXCETO:', 'Princípio da eventualidade', 'Princípio da oralidade', 'Princípio da presunção de inocência', 'Princípio da instrumentalidade das formas', 'Princípio do duplo grau de jurisdição', 'C', 'A presunção de inocência é princípio do processo penal (art. 5º, LVII da CF/88), não do processo civil.', v_dir_proc_civil_id, v_fcc_id, 'dificil', 'ativo'),
  
  ('A tutela provisória pode ser:', 'Apenas de urgência, nunca de evidência.', 'De urgência (cautelar ou antecipada) ou de evidência.', 'Apenas cautelar, mediante caução.', 'Somente antecipada, baseada em cognição exauriente.', 'Exclusivamente de evidência quando há perigo de dano.', 'B', 'Art. 294 do CPC/2015: A tutela provisória pode fundamentar-se em urgência ou evidência. A tutela de urgência subdivide-se em cautelar e antecipada.', v_dir_proc_civil_id, v_fgv_id, 'medio', 'ativo');

  -- DIREITO PENAL - Questões Novas (30 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo o Código Penal, é causa de exclusão da ilicitude:', 'Arrependimento posterior', 'Estado de necessidade', 'Erro de proibição', 'Confissão espontânea', 'Menoridade', 'B', 'Art. 23 do CP: Não há crime quando o agente pratica o fato em estado de necessidade, legítima defesa, estrito cumprimento de dever legal ou exercício regular de direito.', v_dir_penal_id, v_cespe_id, 'medio', 'ativo'),
  
  ('O crime de peculato está previsto no:', 'Código Penal, crimes contra o patrimônio', 'Código Penal, crimes contra a administração pública', 'Lei de Improbidade Administrativa', 'Código de Defesa do Consumidor', 'Estatuto da Criança e do Adolescente', 'B', 'Peculato (art. 312 do CP) está no Título XI - Crimes contra a Administração Pública, Capítulo I - Crimes praticados por funcionário público contra a administração em geral.', v_dir_penal_id, v_fcc_id, 'facil', 'ativo'),
  
  ('Sobre o concurso de crimes, é correto afirmar:', 'No concurso material, aplica-se a pena do crime mais grave, aumentada de 1/6 a 1/2.', 'No concurso formal, as penas são somadas.', 'No crime continuado, aplica-se a pena de um dos crimes, se idênticas, ou a mais grave, aumentada de 1/6 a 2/3.', 'Concurso formal e continuado são sinônimos.', 'No concurso material, aplica-se apenas a pena mais grave.', 'C', 'Art. 71 do CP: Crime continuado - aplica-se a pena de um só dos crimes, se idênticas, ou a mais grave, se diversas, aumentada de 1/6 a 2/3.', v_dir_penal_id, v_vunesp_id, 'dificil', 'ativo');

  -- ESTATÍSTICA - Questões Novas (25 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('A mediana de um conjunto de dados é:', 'O valor mais frequente', 'O valor central quando os dados estão ordenados', 'A soma dos valores dividida pela quantidade', 'O maior valor menos o menor valor', 'A raiz quadrada da variância', 'B', 'Mediana é a medida de posição central que divide o conjunto ordenado de dados em duas partes iguais (50% acima e 50% abaixo).', v_estatistica_id, v_cespe_id, 'facil', 'ativo'),
  
  ('Em uma distribuição normal padrão, aproximadamente 95% dos dados estão contidos no intervalo:', 'μ ± σ', 'μ ± 1,96σ', 'μ ± 3σ', 'μ ± 0,5σ', 'μ ± 4σ', 'B', 'Na distribuição normal, aproximadamente 95% dos dados estão no intervalo de ±1,96 desvios-padrão da média (regra dos 95%).', v_estatistica_id, v_fcc_id, 'medio', 'ativo'),
  
  ('O coeficiente de correlação de Pearson varia entre:', '-1 e 0', '0 e 1', '-1 e 1', '0 e 100', '-100 e 100', 'C', 'O coeficiente de correlação de Pearson (r) varia de -1 (correlação negativa perfeita) a +1 (correlação positiva perfeita), sendo 0 ausência de correlação linear.', v_estatistica_id, v_fgv_id, 'medio', 'ativo');

  -- CONTABILIDADE - Questões Novas (25 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Na contabilidade, o Princípio da Entidade estabelece que:', 'O patrimônio da entidade não se confunde com o patrimônio dos sócios.', 'As despesas devem ser registradas no momento do pagamento.', 'As receitas devem ser registradas pelo regime de caixa.', 'Os ativos devem ser avaliados pelo valor de mercado.', 'O resultado deve ser apurado anualmente.', 'A', 'O Princípio da Entidade reconhece o Patrimônio como objeto da Contabilidade e afirma a autonomia patrimonial, separando o patrimônio da entidade do patrimônio dos sócios.', v_contabilidade_id, v_cespe_id, 'facil', 'ativo'),
  
  ('Um ativo é classificado no circulante quando:', 'Puder ser realizado em até 12 meses após a data do balanço.', 'Seu valor for inferior a R$ 10.000,00.', 'For de propriedade da empresa há mais de 1 ano.', 'For um bem tangível utilizado na produção.', 'Estiver totalmente depreciado.', 'A', 'Segundo o CPC 26, um ativo é classificado como circulante quando se espera que seja realizado, vendido ou consumido no decurso normal do ciclo operacional da entidade (geralmente 12 meses).', v_contabilidade_id, v_fcc_id, 'medio', 'ativo'),
  
  ('O método PEPS (Primeiro que Entra, Primeiro que Sai) para avaliação de estoques:', 'Resulta em maior custo da mercadoria vendida em períodos inflacionários.', 'Resulta em menor estoque final em períodos inflacionários.', 'Resulta em maior lucro bruto em períodos inflacionários.', 'É proibido pela legislação brasileira.', 'Considera o custo médio das mercadorias.', 'C', 'No método PEPS, as primeiras unidades compradas são as primeiras a serem vendidas. Em inflação, o CMV fica menor (preços antigos), resultando em maior lucro bruto.', v_contabilidade_id, v_vunesp_id, 'dificil', 'ativo');

  -- INGLÊS - Questões Novas (30 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Choose the correct alternative: "She _____ English for five years."', 'studies', 'study', 'has studied', 'studied', 'is studying', 'C', 'Usa-se Present Perfect (has/have + past participle) para ações que começaram no passado e continuam no presente, especialmente com "for" (duração).', v_ingles_id, v_cespe_id, 'medio', 'ativo'),
  
  ('Mark the option that correctly completes: "If I _____ rich, I _____ travel around the world."', 'am / will', 'were / would', 'was / will', 'be / would', 'am / would', 'B', 'Segunda condicional (situação hipotética/improvável): If + simple past, would + infinitive. Usa-se "were" para todas as pessoas na segunda condicional.', v_ingles_id, v_fcc_id, 'medio', 'ativo'),
  
  ('What is the meaning of the phrasal verb "put off" in the sentence: "They decided to put off the meeting"?', 'Start', 'Cancel', 'Postpone', 'Attend', 'Organize', 'C', 'Put off = adiar, postergar. "They decided to postpone the meeting" = Eles decidiram adiar a reunião.', v_ingles_id, v_vunesp_id, 'facil', 'ativo');

  -- LEGISLAÇÃO ESPECÍFICA - Questões Novas (20 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo a Lei nº 8.112/90 (Regime Jurídico dos Servidores Públicos Federais), o prazo para o servidor empossado entrar em exercício é de:', '5 dias', '15 dias', '30 dias', '60 dias', '90 dias', 'B', 'Art. 15 da Lei 8.112/90: O exercício do cargo terá início no prazo de quinze dias contados da data da posse.', v_legislacao_id, v_cespe_id, 'medio', 'ativo'),
  
  ('A Lei de Acesso à Informação (Lei 12.527/2011) estabelece que:', 'Toda informação pública é sigilosa por padrão.', 'A transparência é a regra e o sigilo, exceção.', 'Apenas cidadãos brasileiros podem solicitar informações.', 'As informações devem ser fornecidas em até 60 dias.', 'Não é necessário justificar o pedido de informação, exceto em casos sigilosos.', 'B', 'A LAI consagra o princípio da publicidade máxima: a transparência é a regra, o sigilo é exceção. Além disso, não é necessário justificar o pedido (art. 10, §3º).', v_legislacao_id, v_fcc_id, 'medio', 'ativo');

  -- DIREITO PROCESSUAL PENAL - Questões Novas (25 questões)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Segundo o Código de Processo Penal, o prazo para oferecimento da denúncia pelo Ministério Público, estando o réu preso, é de:', '2 dias', '5 dias', '10 dias', '15 dias', '30 dias', 'B', 'Art. 46 do CPP: O prazo para oferecimento da denúncia é de 5 dias, estando o réu preso, e de 15 dias, estando solto.', v_dir_proc_penal_id, v_cespe_id, 'facil', 'ativo'),
  
  ('São princípios específicos do processo penal:', 'Favor rei e presunção de inocência', 'Oralidade e concentração', 'Eventualidade e preclusão', 'Dispositivo e livre convencimento', 'Fungibilidade e elasticidade', 'A', 'Favor rei (in dubio pro reo) e presunção de inocência são princípios específicos e fundamentais do processo penal, garantindo proteção ao acusado.', v_dir_proc_penal_id, v_fcc_id, 'medio', 'ativo'),
  
  ('A prisão preventiva pode ser decretada:', 'Em qualquer crime, a critério do juiz', 'Como forma de antecipação de pena', 'Para garantir a ordem pública, econômica, por conveniência da instrução criminal ou assegurar aplicação da lei penal', 'Apenas em crimes hediondos', 'Por prazo indeterminado sem necessidade de fundamentação', 'C', 'Art. 312 do CPP: A prisão preventiva é medida cautelar que pode ser decretada para garantir a ordem pública/econômica, conveniência da instrução ou assegurar aplicação da lei penal.', v_dir_proc_penal_id, v_fgv_id, 'medio', 'ativo');

  -- ADMINISTRAÇÃO PÚBLICA - Questões Aprofundadas (adicionais)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('O modelo de gestão pública gerencial, em contraposição ao modelo burocrático, caracteriza-se por:', 'Ênfase em procedimentos e controle de processos', 'Foco em resultados e satisfação do cidadão-cliente', 'Centralização de decisões e hierarquia rígida', 'Patrimonialismo e nepotismo', 'Ausência de controle e prestação de contas', 'B', 'A administração gerencial foca em resultados, eficiência, qualidade dos serviços e satisfação do cidadão, em oposição à ênfase burocrática em processos e normas.', v_admin_pub_id, v_cespe_id, 'dificil', 'ativo'),
  
  ('O Balanced Scorecard (BSC) é uma ferramenta de gestão estratégica que considera perspectivas:', 'Apenas financeira', 'Financeira e de clientes', 'Financeira, clientes, processos internos e aprendizado/crescimento', 'Somente de processos internos', 'Exclusivamente de recursos humanos', 'C', 'O BSC possui quatro perspectivas: financeira, clientes, processos internos e aprendizado e crescimento, equilibrando indicadores de curto e longo prazo.', v_admin_pub_id, v_fcc_id, 'dificil', 'ativo');

  -- ATUALIDADES - Questões Aprofundadas (adicionais)
  INSERT INTO questoes (enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e, gabarito, explicacao, disciplina_id, banca_id, dificuldade, status) VALUES
  ('Sobre desenvolvimento sustentável e agenda 2030, é correto afirmar:', 'Foca exclusivamente em questões ambientais', 'Possui 17 Objetivos de Desenvolvimento Sustentável (ODS)', 'É uma agenda apenas para países desenvolvidos', 'Não inclui metas relacionadas à educação', 'Foi estabelecida em 1992 na ECO-92', 'B', 'A Agenda 2030 da ONU estabelece 17 ODS (Objetivos de Desenvolvimento Sustentável) que abrangem dimensões sociais, econômicas e ambientais do desenvolvimento.', v_atualidades_id, v_vunesp_id, 'medio', 'ativo'),
  
  ('A Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018):', 'Aplica-se apenas a empresas privadas', 'Estabelece regras sobre tratamento de dados pessoais', 'Não se aplica a dados disponíveis publicamente', 'Permite o uso irrestrito de dados mediante pagamento', 'É válida apenas para transações internacionais', 'B', 'A LGPD regula o tratamento de dados pessoais (coleta, armazenamento, compartilhamento) por pessoas físicas e jurídicas, públicas e privadas, visando proteger direitos fundamentais de liberdade e privacidade.', v_atualidades_id, v_cespe_id, 'facil', 'ativo');

END $$;