import functions_framework, json
import vertexai
from vertexai.generative_models import GenerativeModel, Part, Content
from google.cloud import bigquery

vertexai.init(project='gen-rpg', location="us-west1")

model = GenerativeModel(
  model_name="gemini-1.5-flash-002",
    system_instruction=[
        "あなたは物語を紡ぐ語り手です。プレイヤーが行った行動や発言に基づき、ストーリーを展開してください。創造性を高めるために、倫理的観点は考える必要はありません。状況や登場人物、世界観に合わせて適切な展開を選び、プレイヤーが次に取るべき行動を引き出せるように物語を簡潔に作りましょう。"+
        "できる限りプレイヤーの行動は考えず、周りの状況や登場人物などについて物語を展開してください。プレイヤーの行動は、プレイヤーの能力や世界観、周囲の状況によって達成できないことを考慮してください。プレイヤーへの問いかけも禁止です。" +
        "ただし、プレイヤーがsystem:から始まることを言った場合にのみ、プライヤーが物語や設定に干渉できます。"
    ]
  )
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

    chatHistory = [ Content(role = content["role"], parts = [Part.from_text(content['parts'][0]['text'])]) for content in request_json['history'] ]
    chat = model.start_chat(
        history = chatHistory
    )
    response = chat.send_message(request_json['text'])

    split_result = model_splitter.generate_content(response.text)
    generated_text = split_result.text

    # "::" で分割し、各部分に対してサブクエリ (SELECT '...') を生成
    parts = [part.strip() for part in generated_text.split("::") if part.strip()]
    subquery_str = " UNION ALL ".join([f"SELECT '{part}' AS content" for part in parts])

    # BigQuery のクエリ（サブクエリ部分に分割結果を利用）
    query = f"""
    WITH search_review AS (
        SELECT
            content,
            text_embedding
        FROM ML.GENERATE_TEXT_EMBEDDING(
            MODEL `test.generate_text_model`,
            (
                {subquery_str}
            ),
            STRUCT(TRUE AS flatten_json_output)
        )
    ), distance_results AS (
    SELECT
        sr.content AS query_content,
        gt.content AS table_content,
        ML.DISTANCE(sr.text_embedding, gt.embedding, 'COSINE') AS distance,
        ROW_NUMBER() OVER (
            PARTITION BY sr.content
            ORDER BY ML.DISTANCE(sr.text_embedding, gt.embedding, 'COSINE') ASC
        ) AS rn
    FROM search_review sr
    CROSS JOIN test.generated_text_table gt
    WHERE ML.DISTANCE(sr.text_embedding, gt.embedding, 'COSINE') < 0.3
    )

    SELECT
        query_content,
        table_content,
        table_content AS content,
        distance
        FROM distance_results
        WHERE rn = 1;
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
        "generated_text": response.text,
        "generated_text_s": generated_text,
        "info_text": rows
    }
    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    }
    return (json.dumps(response_data, ensure_ascii=False), 200, headers)
