import functions_framework, json
import vertexai
from vertexai.generative_models import GenerativeModel
from google.cloud import bigquery

vertexai.init(project='gen-rpg', location="us-west1")

model_splitter = GenerativeModel(
  model_name="gemini-1.5-flash-002",
    system_instruction=[
        "あなたは物語やストーリーの内容を適切なコンテキストに分割する役割を担っています。文脈を壊さない範囲で適切な区切りを設けてください。区切り文字は「::」です。"
    ]
  )

# BigQueryクライアントを初期化し、クエリを実行する
client = bigquery.Client(project='gen-rpg')

@functions_framework.http
def hello_http(request):
    # Set CORS headers for the preflight request
    if request.method == "OPTIONS":
        # Allows GET requests from any origin with the Content-Type
        headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type",
        }

        return ("", 204, headers)

    request_json = request.get_json(silent=True)

    split_result = model_splitter.generate_content(request_json['text'])
    generated_text = split_result.text

    # "::" で分割し、各部分に対してサブクエリ (SELECT '...') を生成
    parts = [part.strip() for part in generated_text.split("::") if part.strip()]
    subquery_str = " UNION ALL ".join([f"SELECT '{part}' AS content" for part in parts])

    # BigQuery のクエリ（サブクエリ部分に分割結果を利用）
    query = f"""
    INSERT INTO `gen-rpg.test.generated_text_table` (content, embedding)
    SELECT content, text_embedding AS embedding
    FROM ML.GENERATE_TEXT_EMBEDDING(
      MODEL `gen-rpg.test.generate_text_model`,
      ({subquery_str})
    )
    """


    try:
        job_config = bigquery.QueryJobConfig()
        query_job = client.query(
        query,
        job_config=job_config,
        )
        results = query_job.result()  # クエリ完了待ち
        # 結果行を辞書のリストに変換
        rows = []
        for row in results:
            rows.append({
                "distance": row.distance,
                "content": row.content
            })
    except Exception as e:
        print(e)
        return f"BigQuery job failed: {e}", 500

    # レスポンスのJSON作成
    response_data = {
    }
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }
    return (json.dumps(response_data, ensure_ascii=False), 200, headers)
