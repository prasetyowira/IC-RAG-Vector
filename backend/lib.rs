use candid::{CandidType, Principal};
mod vdb;
mod client;
mod extractor;

use ic_cdk_macros::{query, update};
use ic_stable_structures::Storable;
use ic_stable_structures::writer::Writer;
use ic_stable_structures::Memory as _;
use serde::Deserialize;
use serde_bytes::ByteBuf;
use vdb::db::DB;
use vdb::collection::DocMetadata;
use vdb::error::Error;
use vdb::memory::{is_owner, set_config_map,get_config_map_by_key, get_upgrades_memory};
use crate::client::{generate_embeddings, extract_text_from_bytebuf};

const OPENAI_API_KEY: &str = "OPENAI_KEY";

#[derive(Clone, Debug, Default, CandidType, Deserialize)]
pub struct InstallArgs {
    #[serde(rename = "openApiKeys")]
    pub openai_key: String,
}
#[ic_cdk::init]
fn init(args: InstallArgs) {
    set_config_map(OPENAI_API_KEY.to_string(), args.openai_key);
}

#[ic_cdk::pre_upgrade]
fn pre_upgrade() {
    // Serialize the state.
    let mut state_bytes = vec![];
    DB.with(|s| ciborium::ser::into_writer(&*s.borrow(), &mut state_bytes))
        .expect("failed to encode state");

    // Write the length of the serialized bytes to memory, followed by the
    // by the bytes themselves.
    let len = state_bytes.len() as u32;
    let mut memory = get_upgrades_memory();
    let mut writer = Writer::new(&mut memory, 0);
    writer.write(&len.to_le_bytes()).unwrap();
    writer.write(&state_bytes).unwrap()
}
#[ic_cdk::post_upgrade]
fn post_upgrade(args: InstallArgs) {
    set_config_map(OPENAI_API_KEY.to_string(), args.openai_key);

    let memory = get_upgrades_memory();
    // Read the length of the state bytes.
    let mut state_len_bytes = [0; 4];
    memory.read(0, &mut state_len_bytes);
    let state_len = u32::from_le_bytes(state_len_bytes) as usize;

    // Read the bytes
    let mut state_bytes = vec![0; state_len];
    memory.read(4, &mut state_bytes);

    // Deserialize and set the state.
    let state = ciborium::de::from_reader(&*state_bytes).expect("failed to decode state");
    DB.with(|s| *s.borrow_mut() = state);
}

#[query]
fn check_is_owner() -> bool {
    let is_owner = is_owner();
    is_owner
}

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

    // Check if file_type is valid, only pdf, txt, docs  are allowed. and throw FileTypeNotSupported error
    let valid_file_types = vec!["pdf", "text", "docs"];
    if !valid_file_types.contains(&file_type.as_str()) {
        return Err(Error::FileTypeNotSupported);
    }

    // let content = data.clone();
    // get open api key from env var
    let api_key = get_config_map_by_key(OPENAI_API_KEY.to_string()).unwrap();

    // Extract text content based on file type
    let text_content = match extract_text_from_bytebuf(&data, &file_type) {
        Ok(text) => text,
        Err(_) => return Err(Error::FileTypeNotSupported),
    };

    // Generate embeddings using OpenAI API
    let embeddings = match generate_embeddings(&text_content, &api_key).await {
        Ok(emb) => emb,
        Err(err) => return Err(Error::ModelError(err)),
    };

    let file_size = data.len() as u64;
    let created_at = ic_cdk::api::time() / 1_000_000;

    // Insert into collection with proper error handling
    DB.with(|db| {
        let mut db = db.borrow_mut();
        let exist = db.collections.contains_key(&collection_name);
        if !exist {
            db.create_collection(collection_name.clone(), 1000).unwrap();
        }
        
        // Insert the document and handle error
        match db.insert_into_collection(&collection_name, vec![embeddings], vec![text_content], filename.clone(), title, file_type, file_size, created_at) {
            Ok(_) => {
                // Rebuild index
                db.build_index(&collection_name)?;
                Ok(format!("Doc {} upload success!", filename))
            },
            Err(e) => Err(e),
        }
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

    DB.with(|db| {
        let mut db = db.borrow_mut();

        match db.collections.contains_key(&name.clone()){
            true => {},
            false => {
                db.create_collection(name.clone(), 1000).unwrap();
            }
        };

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

