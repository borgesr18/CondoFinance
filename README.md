
# CondoFinance SaaS

Sistema de gestão financeira para condomínios.

## Setup Definitivo do Banco de Dados (Supabase)

Para garantir que não ocorram erros de dependência ou timeout, a criação do banco foi dividida em **13 arquivos**. Execute-os no **SQL Editor** do Supabase na ordem exata abaixo:

1.  `01_extensions.sql` - Extensões do Postgres.
2.  `02_enums.sql` - Tipos de dados (Status, Papéis).
3.  `03_table_condominios.sql` - Tabela principal.
4.  `04_table_membros.sql` - Vínculo Usuários.
5.  `05_table_auditoria.sql` - Logs.
6.  `06_table_unidades.sql` - Estrutura física.
7.  `07_table_rh.sql` - Funcionários.
8.  `08_table_finance_aux.sql` - Categorias e Fornecedores.
9.  `09_table_lancamentos.sql` - Receitas e Despesas.
10. `10_table_cobrancas.sql` - Boletos e Acordos.
11. `11_functions_triggers.sql` - Lógica do banco.
12. `12_rls_policies.sql` - Segurança e Permissões.
13. `13_seeds.sql` - Dados de exemplo.

## Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```
