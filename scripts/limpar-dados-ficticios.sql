-- Script para limpar todos os dados fictícios e manter apenas dados reais
-- Executar este script para remover dados de exemplo/demonstração

-- Limpar dados fictícios mantendo apenas estrutura e dados essenciais
BEGIN;

-- 1. Limpar movimentações de estoque fictícias
DELETE FROM MovimentacaoEstoque WHERE observacoes LIKE '%exemplo%' OR observacoes LIKE '%BioTech%' OR observacoes LIKE '%MedLab%';

-- 2. Limpar emails fictícios
DELETE FROM Email WHERE corpo LIKE '%exemplo%' OR assunto LIKE '%Relatório Diário%' OR assunto LIKE '%Alerta: Estoque%';

-- 3. Limpar tarefas fictícias
DELETE FROM Tarefa WHERE titulo LIKE '%Revisar estoque%' OR titulo LIKE '%Atualizar preços%' OR titulo LIKE '%Preparar relatório%';

-- 4. Limpar sugestões de compra fictícias
DELETE FROM SugestaoCompra WHERE id_produto IN (
  SELECT id_produto FROM Produto WHERE sku LIKE 'PCR-%' AND id_empresa = 1
);

-- 5. Limpar pedidos fictícios (manter apenas os criados pelo usuário)
DELETE FROM Pedido WHERE fornecedor IN ('BioTech LTDA', 'MedLab Supply', 'Diagnósticos S.A.', 'PCR Labor') 
  AND id_produto IN (
    SELECT id_produto FROM Produto WHERE sku LIKE 'PCR-%' AND id_empresa = 1
  );

-- 6. Limpar vendas fictícias
DELETE FROM Venda WHERE id_produto IN (
  SELECT id_produto FROM Produto WHERE sku LIKE 'PCR-%' AND id_empresa = 1
);

-- 7. Limpar produtos fictícios (manter apenas os criados pelo usuário)
DELETE FROM Produto WHERE sku LIKE 'PCR-%' AND id_empresa = 1;

-- 8. Limpar fornecedores fictícios
DELETE FROM Fornecedor WHERE nome IN ('BioTech Suprimentos Ltda', 'MedLab Equipamentos S.A.', 'LabCorp Distribuidora', 'Diagnósticos Unidos');

-- 9. Manter apenas plataformas essenciais (não remover pois são necessárias)
-- DELETE FROM Plataforma; -- NÃO REMOVER - são necessárias

-- 10. Manter empresa PCR Labor (empresa padrão) mas limpar outras empresas fictícias se existirem
-- DELETE FROM Empresa WHERE nome_fantasia != 'PCR Labor'; -- CUIDADO - pode quebrar referências

-- 11. Manter usuário admin mas limpar outros usuários fictícios
-- DELETE FROM Usuario WHERE email != 'admin@pcrlabor.com'; -- CUIDADO - pode quebrar sessões

COMMIT;

-- Verificar o que restou
SELECT 'Produtos restantes' as tabela, COUNT(*) as total FROM Produto
UNION ALL
SELECT 'Vendas restantes', COUNT(*) FROM Venda
UNION ALL
SELECT 'Pedidos restantes', COUNT(*) FROM Pedido
UNION ALL
SELECT 'Fornecedores restantes', COUNT(*) FROM Fornecedor
UNION ALL
SELECT 'Empresas restantes', COUNT(*) FROM Empresa
UNION ALL
SELECT 'Usuários restantes', COUNT(*) FROM Usuario
UNION ALL
SELECT 'Plataformas restantes', COUNT(*) FROM Plataforma;
