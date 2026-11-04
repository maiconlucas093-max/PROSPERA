Diário de Desenvolvimento — PROSPERA

Repositório: https://github.com/maiconlucas093-max/PROSPERA
Site: https://maiconlucas093-max.github.io/PROSPERA/
Branch: "master"
Última atualização: 04/11/2026

1. Objetivo

O PROSPERA é a central de organização da vida, rotina e evolução pessoal. Deve equilibrar trabalho, saúde, alimentação, estudos, finanças, família e projetos, sem deixar que a programação ocupe todo o dia.

A agenda central é a protagonista. Os demais projetos devem fornecer informações e atividades, sem substituí-la.

2. Rotina e objetivos

- Acordar aproximadamente às 05:30.
- Trabalho CLT: das 06:50 às 16:50.
- Deslocamento a pé e chegada em casa por volta de 18:30.
- Fins de semana prioritariamente para filhos e família.
- Programar apenas em blocos curtos nos fins de semana.
- Planejar aporte de R$ 1.000 na bolsa no quinto dia útil de cada mês, com lembrete.
- Evitar programação excessiva até tarde da noite.

3. Projetos relacionados

- Viva Fit Pro — saúde e movimento.
- Casa e Chef — alimentação e receitas.
- Academia da Mente — estudos e desenvolvimento cognitivo.

Esses projetos não devem ofuscar a agenda principal.

4. Estado do frontend

Arquivos conhecidos:

- "index.html" — estrutura do painel.
- "style.css" — estilos separados do HTML.
- "script.js" — navegação.
- "supabase.js" — inicialização do cliente Supabase.

No último estado revisado, os scripts eram carregados nesta ordem:

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0"></script>
<script src="supabase.js"></script>
<script src="script.js"></script>

O usuário confirmou que o site carregou normalmente depois da integração inicial.

Ainda não confirmado: teste funcional de leitura e escrita no Supabase pelo navegador, inspeção do console e autenticação completa.

Nunca colocar chaves "service_role", secrets, senhas ou tokens privados no frontend ou no GitHub.

5. Estado do Supabase

Projeto PROSPERA:

- Project ref: "fwcfuxsvwexpuxozpkuj"
- Região: "sa-east-1"
- Organização: "vbnpjzufzqrdmtpnfxmp"
- Status anteriormente consultado: "ACTIVE_HEALTHY"

Tabelas criadas com RLS habilitado:

- "profiles"
- "agenda_items"
- "habits"
- "habit_logs"
- "financial_contributions"

As políticas RLS devem ser revisadas e testadas antes de considerar os dados protegidos. Esconder a interface no frontend não substitui a segurança do banco.

6. Autenticação — etapa pendente

Foi planejada uma tela de cadastro e login usando Supabase Auth. As instruções foram enviadas, mas a aplicação das alterações e o push ainda não foram confirmados.

Alterações previstas:

1. Adicionar a classe "auth-required" ao body do "index.html".
2. Inserir a tela de cadastro e login antes do painel.
3. Adicionar identificação do usuário e botão Sair no cabeçalho.
4. Criar "auth.js" para cadastro, login, sessão e logout.
5. Adicionar os estilos de autenticação ao final de "style.css".
6. Carregar os scripts nesta ordem:

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0"></script>
<script src="supabase.js"></script>
<script src="auth.js"></script>
<script src="script.js"></script>

Antes dos testes, conferir no Supabase Auth:

- Site URL.
- Redirect URLs autorizadas, incluindo a URL do GitHub Pages.
- Configuração de confirmação de e-mail.

Depois do push, testar cadastro, confirmação de e-mail, login, persistência de sessão e logout.

7. Fluxo de trabalho

- O usuário edita pelo SPCK no Android.
- O usuário faz push para o GitHub.
- Quando disser “push confirmado”, revisar os arquivos atualizados.
- Dar instruções pequenas, claras e precisas.
- Indicar trechos exatos para localizar e substituir.
- Manter CSS separado do HTML.
- Não alterar serviços, repositórios ou banco sem autorização explícita.
- Após cada revisão, perguntar “Posso continuar?”
- Atualizar este diário ao concluir etapas importantes.

8. Próxima etapa

Retomar a implementação da tela de cadastro e login.

Primeiro, verificar o estado atual de "index.html", "style.css" e confirmar se "auth.js" já existe. Não presumir que as instruções anteriores foram aplicadas.

Histórico

04/11/2026

- Registrada a estrutura conhecida do projeto.
- Documentado o estado da conexão Supabase e das tabelas.
- Registrados os objetivos de rotina.
- Identificada a autenticação como próxima etapa pendente.