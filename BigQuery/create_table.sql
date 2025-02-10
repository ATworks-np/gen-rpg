CREATE OR REPLACE TABLE `gen-rpg.test.generated_text_table_2` AS
SELECT content, text_embedding AS embedding
FROM ML.GENERATE_TEXT_EMBEDDING(
        MODEL `test.generate_text_model`,
        (SELECT 'ここにプロンプトとなるテキストを入力' AS content)
     );