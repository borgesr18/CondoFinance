# Cronograma de Execução do Banco de Dados

Para evitar o erro "Internal error occurred" ou Timeouts no Supabase, execute os scripts abaixo **um por um**, na ordem exata. Aguarde a mensagem "Success" antes de passar para o próximo.

## Ordem de Execução

1.  **supabase/01_limpeza.sql**
    *   *O que faz:* Remove todas as tabelas e tipos existentes para começar do zero.
    
2.  **supabase/02_tipos_base.sql**
    *   *O que faz:* Ativa extensões (UUID) e cria os Enums (Papéis de usuário, Status de transação, etc).

3.  **supabase/03_tabelas_estruturais.sql**
    *   *O que faz:* Cria as tabelas `condominios`, `membros`, `unidades` e `responsaveis`.

4.  **supabase/04_tabelas_financeiras.sql**
    *   *O que faz:* Cria as tabelas de `categorias`, `fornecedores`, `contas_bancarias`.

5.  **supabase/05_tabelas_movimentacao.sql**
    *   *O que faz:* Cria as tabelas pesadas de `lancamentos` (receitas/despesas) e `cobrancas` (boletos).

6.  **supabase/06_funcoes_seguranca.sql**
    *   *O que faz:* Cria funções auxiliares (`is_admin`, `get_user_role`). 
    *   *Importante:* Usa `SECURITY DEFINER` para evitar loops de permissão.

7.  **supabase/07_rls_estrutural.sql**
    *   *O que faz:* Ativa a segurança (RLS) e cria políticas para Condomínios, Membros e Unidades.

8.  **supabase/08_rls_financeiro.sql**
    *   *O que faz:* Cria políticas de segurança para Lançamentos, Contas e Cobranças.

9.  **supabase/09_seeds.sql**
    *   *O que faz:* Insere um condomínio de teste, um usuário Admin e alguns dados financeiros iniciais.
