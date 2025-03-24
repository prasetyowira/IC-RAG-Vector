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
use vdb::collection::DocMetadata;
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
    file_type: String,
    embedding: Embedding,
}

// Define a ChatMessage struct for our Candid interface
#[derive(CandidType, Serialize, Deserialize, Debug, Clone)]
pub struct ChatMessage {
    role: String, // "user", "assistant", or "system"
    content: String,
}


//// EMBEDDING + Knowledge BASE CRUD
// --- CREATE + EMBEDDING ---
#[update]
async fn upload_file(file_type: String, title: String, filename: String, data: ByteBuf) -> Result<String, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let collection_name = user.to_string();

    let mut content = data.clone();

    // Check if file_type is valid, only pdf, txt, and valid public link are allowed
    if file_type != "pdf" && file_type != "txt" && file_type != "link" {
        return Err(Error::InvalidInput);
    }

    // if file_type is link, validate the link
    if file_type == "link" {
        // change data to link
        let link = String::from_utf8(content.clone().to_vec()).unwrap();

        if !validate_link(link) {
            return Err(Error::InvalidInput);
        }

        let result = download_file_from_link(link).await?;
        content = ByteBuf::from(result);
    }

    // check if collection exists, if not create new collection
    if !DB.with(|db| db.borrow().collections.contains_key(&collection_name)) {
        create_collection(collection_name.clone(), 1536).await?;
    }

    // Convert ByteBuf to UTF-8 string with proper error handling
    let content_str = match String::from_utf8(content.to_vec()) {
        Ok(content) => content,
        Err(_) => return Err(Error::InvalidInput),
    };
    
    // Create chunk and embedding
    let chunk = Chunk::new(content_str.clone());
    let embedding = embed_content(chunk).await;
    let file_size = content.len() as u64;
    let created_at = ic_cdk::api::time();

    // Insert into collection with proper error handling
    DB.with(|db| {
        let mut db = db.borrow_mut();
        
        // Insert the document and handle error
        match db.insert_into_collection(&collection_name, vec![embedding], vec![content_str], filename.clone(), title, file_type, file_size, created_at) {
            Ok(_) => {
                // Rebuild index
                db.build_index(&collection_name)?;
                Ok(format!("Doc {} upload success!", filename))
            },
            Err(e) => Err(e),
        }
    })
}

// --- UPDATE + RE-EMBED ---
#[update]
async fn update_document(
    filename: String, data: ByteBuf
) -> Result<String, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let name = user.to_string();

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
        let docs = db.get_docs_by_query(&name, CollectionQuery {
            file_name: Some(filename.clone()),
        })?;
        if docs.is_empty() {
            return Err(Error::NotFound);
        }

        
        // Remove old document
        db.remove_document_from_collection(&name, &filename)?;
        
        // Insert updated document
        db.insert_into_collection(&name, vec![embedding], vec![content_str.clone()], filename.clone(), title, file_type, file_size, created_at)?;
        
        // Rebuild index
        db.build_index(&name)?;
        
        Ok(format!("Document '{}' successfully updated", filename))
    })
}

// --- DELETE ---
#[update]
async fn delete_document(filename: String) -> Result<String, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let collection_name = user.to_string();

    DB.with(|db| {
        let mut db = db.borrow_mut();
        db.remove_document_from_collection(&collection_name, &filename)?;
        Ok(format!("Document '{}' successfully deleted", filename))
    })
}

// --- LIST DOCS (without embedding) ---
#[query]
async fn list_documents(limit: Option<usize>, offset: Option<usize>) -> Result<Vec<DocMetadata>, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let name = user.to_string();
    
    let limit = limit.unwrap_or(10); // Default limit of 10 documents
    let offset = offset.unwrap_or(0); // Default offset of 0 (start from beginning)

    // Check if collection exists
    if !DB.with(|db| db.borrow().collections.contains_key(&name)) {
        return Err(Error::NotFound);
    }

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
async fn chat(messages: Vec<ChatMessage>) -> Result<String, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let collection_name = user.to_string();
    
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

fn validate_link(link: String) -> bool {
    // check if link is valid
    let url = Url::parse(&link);
    url.is_ok()
}

async fn download_file_from_link(link: String) -> Result<String, Error> {
    let response = reqwest::get(link).await?;
    let content = response.text().await?;
    Ok(content)
}

ic_cdk::export_candid!();

