use rag_toolchain::clients::OpenAIEmbeddingClient;
use rag_toolchain::common::Chunk;
use rag_toolchain::common::OpenAIEmbeddingModel::TextEmbeddingAda002;
use rag_toolchain::clients::AsyncEmbeddingClient;
pub type Embedding = Vec<f32>;

// Helper for generate embedding
pub async fn embed_content(content: Chunk) -> Embedding {
    let client: OpenAIEmbeddingClient =
        OpenAIEmbeddingClient::try_new(TextEmbeddingAda002).unwrap();
    client.generate_embedding(content).await.unwrap().vector()
}