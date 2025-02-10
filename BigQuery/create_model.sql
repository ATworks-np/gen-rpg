CREATE OR REPLACE MODEL test.generate_text_model
  REMOTE WITH CONNECTION `us-west1.vertexai_connection`
   OPTIONS (
    remote_service_type = 'CLOUD_AI_LARGE_LANGUAGE_MODEL_V1',
    ENDPOINT = 'textembedding-gecko-multilingual@001'
  );