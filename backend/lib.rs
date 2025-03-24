use candid::Principal;
mod vdb;

use std::any::Any;
use std::num::NonZeroU32;
use candid::{CandidType};
use ic_cdk_macros::{query, update};
use ic_stable_structures::{
    memory_manager::{VirtualMemory},
    DefaultMemoryImpl,
    Memory as _,
};
use rag_toolchain::{
    clients::OpenAIChatCompletionClient,
    clients::OpenAIModel::{Gpt3Point5Turbo},
    clients::PromptMessage,
    chains::{BasicRAGChain},
    common::Chunk
};
use space::{Metric};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use vdb::db::DB;
use vdb::error::Error;
use vdb::embedding::{Embedding, embed_content};
use vdb::retriever::VectorDBRetriever;


type Memory = VirtualMemory<DefaultMemoryImpl>;
type FileId = String;

#[derive(Clone, CandidType, Serialize, Deserialize)]
struct FileEmbedding {
    id: FileId,
    name: String,
    filename: String,
    embedding: Embedding,
}

// Define a ChatMessage struct for our Candid interface
#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    role: String, // "user", "assistant", or "system"
    content: String,
}


#[update]
async fn create_collection(name: String, dimension: usize) -> Result<(), Error> {
    DB.with(|db| {
        let mut db = db.borrow_mut();
        db.create_collection(name, dimension)
    })
}

#[update]
async fn delete_collection(name: String) -> Result<(), Error> {
    DB.with(|db| {
        let mut db = db.borrow_mut();
        db.delete_collection(&name)
    })
}

//// EMBEDDING + Knowledge BASE CRUD
// --- CREATE + EMBEDDING ---
#[update]
async fn upload_file(name: String, filename: String, data: ByteBuf) -> Result<String, Error> {
    // Convert ByteBuf to UTF-8 string with proper error handling
    let content_str = match String::from_utf8(data.to_vec()) {
        Ok(content) => content,
        Err(_) => return Err(Error::InvalidInput),
    };
    
    // Create chunk and embedding
    let chunk = Chunk::new(content_str.clone());
    let embedding = embed_content(chunk).await;

    // Insert into collection with proper error handling
    DB.with(|db| {
        let mut db = db.borrow_mut();
        
        // Check if collection exists
        if !db.collections.contains_key(&name) {
            return Err(Error::NotFound);
        }
        
        // Insert the document
        match db.insert_into_collection(&name, vec![embedding], vec![content_str], filename.clone()) {
            Ok(_) => Ok(format!("Doc {} upload success!", filename)),
            Err(e) => Err(e),
        }
    })
}

// --- UPDATE + RE-EMBED ---
#[update]
async fn update_document(
    name: String, filename: String, data: ByteBuf
) -> Result<String, Error> {
    let content_str = String::from_utf8(data.to_vec()).unwrap();
    //chunked content
    let chunk = Chunk::new(content_str.clone());
    let embedding = embed_content(chunk).await;

    DB.with(|db| {
        let mut db = db.borrow_mut();
        
        // Check if the collection exists
        if (!db.collections.contains_key(&name)) {
            return Err(Error::NotFound);
        }
        
        // Check if the file exists in the collection
        let docs = match db.get_docs(&name) {
            Ok(docs) => docs,
            Err(_) => return Err(Error::NotFound),
        };
        
        if (!docs.contains(&filename)) {
            return Err(Error::NotFound);
        }
        
        // Remove old document
        db.remove_document_from_collection(&name, &filename)?;
        
        // Insert updated document
        db.insert_into_collection(&name, vec![embedding], vec![content_str.clone()], filename.clone())?;
        
        // Rebuild index
        db.build_index(&name)?;
        
        Ok(format!("Document '{}' successfully updated", filename))
    })
}

// --- DELETE ---
#[update]
async fn delete_document(name: String, filename: String) -> Result<String, Error> {
    DB.with(|db| {
        let mut db = db.borrow_mut();
        db.remove_document_from_collection(&name, &filename)?;
        Ok(format!("Document '{}' successfully deleted", filename))
    })
}

// --- LIST DOCS (without embedding) ---
#[query]
async fn list_documents(name: String, limit: Option<usize>, offset: Option<usize>) -> Result<Vec<String>, Error> {
    let limit = limit.unwrap_or(10); // Default limit of 10 documents
    let offset = offset.unwrap_or(0); // Default offset of 0 (start from beginning)

    DB.with(|db| {
        let mut db = db.borrow_mut();
        let docs = db.get_docs(&name)?;
        
        // Apply pagination
        let total_docs = docs.len();
        if offset >= total_docs {
            return Ok(vec![]); // Return empty if offset is beyond available docs
        }

        // Calculate the end index (ensuring we don't go beyond the array bounds)
        let end = std::cmp::min(offset + limit, total_docs);

        // Return the paginated slice
        Ok(docs[offset..end].to_vec())
    })
}

//// LLM Integration
// --- Chat LLM ---
#[update]
async fn chat(collection_name: String, messages: Vec<ChatMessage>) -> Result<String, Error> {
    if messages.is_empty() {
        return Err(Error::InvalidInput);
    }

    // Get the last message which should be from user
    let last_message = match messages.last() {
        Some(msg) if msg.role == "user" => &msg.content,
        _ => return Err(Error::InvalidInput),
    };

    // 1. Create a knowledge base vector retriever from our vector db
    let retriever = DB.with(|db| -> Result<VectorDBRetriever, Error> {
        let db = db.borrow_mut();
        // Check if collection exists
        if !db.collections.contains_key(&collection_name) {
            return Err(Error::NotFound);
        }

        Ok(VectorDBRetriever::new(collection_name.clone()))
    })?;

    // 2. Create chat client
    let chat_client = OpenAIChatCompletionClient::try_new(Gpt3Point5Turbo)
        .map_err(|_| Error::MemoryError)?;

    // 3. Create a RAG chain
    let chain: BasicRAGChain<OpenAIChatCompletionClient, VectorDBRetriever> = BasicRAGChain::builder()
        .retriever(retriever)
        .chat_client(chat_client)
        .build();

    // let store: PostgresVectorStore =
    //     PostgresVectorStore::try_new("embeddings", TextEmbeddingAda002)
    //         .await
    //         .unwrap();
    // let embedding_client: OpenAIEmbeddingClient =
    //     OpenAIEmbeddingClient::try_new(TextEmbeddingAda002).unwrap();
    // let retriever: PostgresVectorRetriever<OpenAIEmbeddingClient> =
    //     store.as_retriever(embedding_client, DistanceFunction::Cosine);
    // let chain: BasicRAGChain<OpenAIChatCompletionClient, PostgresVectorRetriever<_>> =
    //     BasicRAGChain::builder()
    //         .chat_client(chat_client)
    //         .retriever(retriever)
    //         .build();

    // 4. Create a human prompt from the user's message
    let prompt: PromptMessage = PromptMessage::HumanMessage(last_message.into());

    // 5. Invoke the chain
    let response = chain
        .invoke_chain(prompt, NonZeroU32::new(2).unwrap())
        .await
        .map_err(|_| Error::MemoryError)?;

    Ok(response.content().to_string())

}

#[query]
fn healthcheck() -> String {
    "Canister sehat bro!".to_string()
}

ic_cdk::export_candid!();

