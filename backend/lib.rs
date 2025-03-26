use candid::Principal;
mod vdb;

use ic_cdk_macros::{query, update};
use serde_bytes::ByteBuf;
use vdb::db::DB;
use vdb::collection::{DocMetadata, CollectionQuery};
use vdb::error::Error;

//// VECTOR DB CRUD
// --- CREATE + INSERT ---
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

    let content = data.clone();

    // Check if file_type is valid, only pdf, txt, and valid public link are allowed
    if file_type != "pdf" && file_type != "txt" && file_type != "docs" && file_type != "image" {
        return Err(Error::FileTypeNotSupported);
    }

    // Convert ByteBuf to Vec<f32>
    let vector_value = data.chunks_exact(4)
        .map(TryInto::try_into)
        .map(Result::unwrap)
        .map(f32::from_le_bytes)
        .collect();

    // Convert ByteBuf to UTF-8 string with proper error handling
    let content_str = match String::from_utf8(content.to_vec()) {
        Ok(content) => content,
        Err(_) => return Err(Error::InvalidInput),
    };

    let file_size = content.len() as u64;
    let created_at = ic_cdk::api::time();

    // Insert into collection with proper error handling
    DB.with(|db| {
        let mut db = db.borrow_mut();
        let exist = db.collections.contains_key(&collection_name);
        if !exist {
            db.create_collection(collection_name.clone(), 1000).unwrap();
        }
        
        // Insert the document and handle error
        match db.insert_into_collection(&collection_name, vec![vector_value], vec![content_str], filename.clone(), title, file_type, file_size, created_at) {
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
    file_type: String, title: String, filename: String, data: ByteBuf
) -> Result<String, Error> {
    // get user from ic_cdk::caller()
    let user = ic_cdk::caller();
    // check if user is authenticated
    if user == Principal::anonymous() {
        return Err(Error::Unauthorized);
    }
    // user principal id as collection name
    let name = user.to_string();

    let file_size = data.len() as u64;
    let created_at = ic_cdk::api::time();
    let content_str = String::from_utf8(data.to_vec()).unwrap();
    //chunked content
    // Convert ByteBuf to Vec<f32>
    let vector_value = data.chunks_exact(4)
        .map(TryInto::try_into)
        .map(Result::unwrap)
        .map(f32::from_le_bytes)
        .collect();

    DB.with(|db| {
        let mut db = db.borrow_mut();
        
        // Check if the collection exists
        if !db.collections.contains_key(&name) {
            return Err(Error::NotFound);
        }
        
        // Check if the file exists in the collection
        let docs = db.get_docs_by_query(&name, CollectionQuery {
            title: None,
            file_name: Some(filename.clone()),
            file_type: None,
            date_from: None,
            date_to: None,
        })?;
        if docs.is_empty() {
            return Err(Error::NotFound);
        }

        
        // Remove old document
        db.remove_document_from_collection(&name, &filename)?;
        
        // Insert updated document
        db.insert_into_collection(
            &name,
            vec![vector_value],
            vec![content_str.clone()],
            filename.clone(),
            title, file_type, file_size, created_at
        )?;
        
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

//// LLM Integration | SKIP For now
// --- Chat LLM ---
// #[update]
// async fn chat(messages: Vec<ChatMessage>) -> Result<String, Error> {
//     // get user from ic_cdk::caller()
//     let user = ic_cdk::caller();
//     // check if user is authenticated
//     if user == Principal::anonymous() {
//         return Err(Error::Unauthorized);
//     }
//     // user principal id as collection name
//     let collection_name = user.to_string();
//
//     if messages.is_empty() {
//         return Err(Error::InvalidInput);
//     }
//
//     // Get the last message which should be from user
//     let last_message = match messages.last() {
//         Some(msg) if msg.role == "user" => &msg.content,
//         _ => return Err(Error::InvalidInput),
//     };
//
//     // 1. Create a knowledge base vector retriever from our vector db
//     let retriever = DB.with(|db| -> Result<VectorDBRetriever, Error> {
//         let db = db.borrow_mut();
//         // Check if collection exists
//         if !db.collections.contains_key(&collection_name) {
//             return Err(Error::NotFound);
//         }
//
//         Ok(VectorDBRetriever::new(collection_name.clone()))
//     })?;
//
//     // 2. Create chat client
//     let chat_client = OpenAIChatCompletionClient::try_new(Gpt3Point5Turbo)
//         .map_err(|_| Error::MemoryError)?;
//
//     // 3. Create a RAG chain
//     let chain: BasicRAGChain<OpenAIChatCompletionClient, VectorDBRetriever> = BasicRAGChain::builder()
//         .retriever(retriever)
//         .chat_client(chat_client)
//         .build();
//
//     // let store: PostgresVectorStore =
//     //     PostgresVectorStore::try_new("embeddings", TextEmbeddingAda002)
//     //         .await
//     //         .unwrap();
//     // let embedding_client: OpenAIEmbeddingClient =
//     //     OpenAIEmbeddingClient::try_new(TextEmbeddingAda002).unwrap();
//     // let retriever: PostgresVectorRetriever<OpenAIEmbeddingClient> =
//     //     store.as_retriever(embedding_client, DistanceFunction::Cosine);
//     // let chain: BasicRAGChain<OpenAIChatCompletionClient, PostgresVectorRetriever<_>> =
//     //     BasicRAGChain::builder()
//     //         .chat_client(chat_client)
//     //         .retriever(retriever)
//     //         .build();
//
//     // 4. Create a human prompt from the user's message
//     let prompt: PromptMessage = PromptMessage::HumanMessage(last_message.into());
//
//     // 5. Invoke the chain
//     let response = chain
//         .invoke_chain(prompt, NonZeroU32::new(2).unwrap())
//         .await
//         .map_err(|_| Error::MemoryError)?;
//
//     Ok(response.content().to_string())
//
// }

#[query]
fn healthcheck() -> String {
    "Canister sehat bro!".to_string()
}

// skip this feature for now

// fn validate_link(link: String) -> bool {
//     // check if link is valid
//     let url = Url::parse(&link);
//     url.is_ok()
// }

// async fn download_file_from_link(link: String) -> Result<String, Error> {
//     // First validate the link
//     if !validate_link(link.clone()) {
//         return Err(Error::InvalidLink(format!("Invalid link: {}", link)));
//     }
//
//     // Define request headers - using standard headers for GET request
//     let request_headers = vec![
//         ("Accept", "text/plain,application/json"),
//         ("User-Agent", "IC-Agent"),
//     ];
//
//     // Current time as nanoseconds, used for cycles calculation
//     let now = SystemTime::now()
//         .duration_since(UNIX_EPOCH)
//         .unwrap()
//         .as_nanos();
//
//     // Make the HTTP request
//     // Documentation suggests a minimum of 49M cycles for a simple GET request
//     let cycles = 100_000_000; // Using 100M cycles to ensure we have enough
//
//     let request = http_request(
//         {
//             HttpRequest {
//                 url: link.clone(),
//                 method: "GET".to_string(),
//                 headers: request_headers.into_iter().map(|(k, v)| {
//                     HttpHeader {
//                         name: k.to_string(),
//                         value: v.to_string(),
//                     }
//                 }).collect(),
//                 body: None, // GET requests usually don't have a body
//             }
//         },
//         cycles,
//     );
//
//     match request.await {
//         Ok((response,)) => {
//             // Check if the request was successful (status code 200)
//             if response.status_code != 200 {
//                 return Err(Error::HttpError(format!(
//                     "HTTP request failed with status code: {}",
//                     response.status_code
//                 )));
//             }
//
//             // Convert the body to a String
//             match String::from_utf8(response.body) {
//                 Ok(body) => Ok(body),
//                 Err(e) => Err(Error::DecodingError(format!(
//                     "Failed to decode response body: {}", e
//                 ))),
//             }
//         },
//         Err((code, msg)) => {
//             Err(Error::HttpError(format!(
//                 "HTTP request failed with code {}: {}",
//                 code, msg
//             )))
//         }
//     }
// }


ic_cdk::export_candid!();

