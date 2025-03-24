use std::num::NonZeroU32;
use super::{db::DB, error::Error, embedding::embed_content};
use rag_toolchain::{common::{Chunk, Chunks}, retrievers::AsyncRetriever};

pub struct VectorDBRetriever {
    collection_name: String,
}

impl VectorDBRetriever {
    pub fn new(collection_name: String) -> Self {
        Self { collection_name }
    }

    /// Retrieves relevant documents from the vector database based on the query
    ///
    /// # Arguments
    /// * `query` - The user query to search for relevant documents
    ///
    /// # Returns
    /// * `Result<Vec<String>, Error>` - A list of relevant document contents or an error
    pub async fn retrieve_documents(&self, query: &str) -> Result<Vec<String>, Error> {
        // First embed the query
        let query_embedding = embed_text(query).await?;

        // Query the vector database
        DB.with(|db| {
            let mut db = db.borrow_mut();
            let results = db.query(&self.collection_name, query_embedding, 5)
                .map_err(|_| Error::MemoryError)?;

            // Extract just the content strings from results
            Ok(results.into_iter().map(|(_, content)| content).collect())
        })
    }
}


impl AsyncRetriever for VectorDBRetriever {
    type ErrorType = Error;

    async fn retrieve(
        &self, text: &str, _top_k: NonZeroU32
    ) -> Result<Chunks, Self::ErrorType> {
        // Use the existing retrieve_documents method with the top_k value
        let results = self.retrieve_documents(text).await?;

        // Convert the Vec<String> results to Chunks
        let chunks = results
            .into_iter()
            .map(|content| {
                // Create a chunk for each content string with empty metadata
                Chunk::new(content)
            })
            .collect();

        Ok(chunks)
    }
}


/// Helper function to embed query text using the project's embedding function
async fn embed_text(text: &str) -> Result<Vec<f32>, Error> {
    // Create a chunk from the text
    let chunk = Chunk::new(text.to_string());

    // Using the project's embed_content function
    Ok(embed_content(chunk).await)
}