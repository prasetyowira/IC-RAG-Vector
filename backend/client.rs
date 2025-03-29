use candid::Func;
use ic_cdk::api::management_canister::main::raw_rand;
use ic_cdk::{
    api::management_canister::http_request::{
        http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
        TransformContext, TransformFunc,
    },
    id,
};
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use std::str;
use crate::extractor::pdf_file::extract_text_from_pdf;
use crate::vdb::error::Error;

/// Used to build a request to the Management Canister's `http_request` method.
pub struct CanisterHttpRequest {
    args: CanisterHttpRequestArgument,
    cycles: u128,
}

impl Default for CanisterHttpRequest {
    fn default() -> Self {
        Self::new()
    }
}

/// Checks if the canister is supporting IPv4 exchanges
pub(crate) fn is_ipv4_support_available() -> bool {
    let support = cfg!(feature = "ipv4-support");
    ic_cdk::println!("IPv4 support: {}", support.clone());
    support
}

async fn generate_icp_uuid() -> String {
    let (random_bytes,): (Vec<u8>,) = raw_rand().await.expect("Failed dapetin randomness dari ICP");
    let uuid_bytes: [u8; 16] = random_bytes[..16].try_into().expect("Slice gagal");
    hex::encode(uuid_bytes)
}

impl CanisterHttpRequest {
    /// Creates a new request to be built up by having
    pub fn new() -> Self {
        Self {
            cycles: 0,
            args: CanisterHttpRequestArgument {
                url: Default::default(),
                max_response_bytes: Default::default(),
                headers: vec![HttpHeader {
                    name: "User-Agent".to_string(),
                    value: "Exchange Rate Canister".to_string(),
                }],
                body: Default::default(),
                method: HttpMethod::GET,
                transform: None,
            },
        }
    }

    /// A simple wrapper to assign the URL with the `GET` method.
    pub fn get(self, url: &str) -> Self {
        self.url(url).method(HttpMethod::POST)
    }

    /// Updates the HTTP method in the `args` field.
    pub fn method(mut self, http_method: HttpMethod) -> Self {
        self.args.method = http_method;
        self
    }

    pub fn payload(mut self, body: Option<Vec<u8>>) -> Self {
        self.args.body = body;
        self
    }

    /// Adds HTTP headers for the request
    pub fn add_headers(mut self, headers: Vec<(String, String)>) -> Self {
        self.args
            .headers
            .extend(headers.iter().map(|(name, value)| HttpHeader {
                name: name.to_string(),
                value: value.to_string(),
            }));
        self
    }

    /// Updates the URL in the `args` field.
    pub fn url(mut self, url: &str) -> Self {
        self.args.url = String::from(url);
        self
    }

    /// Updates the transform context of the request.
    pub fn transform_context(mut self, method: &str, context: Vec<u8>) -> Self {
        let context = TransformContext {
            function: TransformFunc(Func {
                principal: id(),
                method: method.to_string(),
            }),
            context,
        };

        self.args.transform = Some(context);
        self
    }

    /// Updates the max_response_bytes of the request.
    pub fn max_response_bytes(mut self, max_response_bytes: u64) -> Self {
        self.args.max_response_bytes = Some(max_response_bytes);
        self
    }

    pub fn cycles(mut self, cycles: u128) -> Self {
        self.cycles = cycles;
        self
    }

    /// Wraps around `http_request` to issue a request to the `http_request` endpoint.
    pub async fn send(self) -> Result<HttpResponse, String> {
        http_request(self.args, self.cycles)
            .await
            .map(|(response,)| response)
            .map_err(|(_rejection_code, message)| message)
    }
}


/// OpenAI API request structure for text embedding
#[derive(Serialize)]
struct OpenAIEmbeddingRequest {
    model: String,
    input: String,
}

/// OpenAI API response structure for embeddings
#[derive(Deserialize)]
struct OpenAIEmbeddingResponse {
    data: Vec<EmbeddingData>,
}

#[derive(Deserialize)]
struct EmbeddingData {
    embedding: Vec<f32>,
}

/// Generates embeddings from text content using OpenAI's API
pub async fn generate_embeddings(text: &str, api_key: &str) -> Result<Vec<f32>, String> {
    is_ipv4_support_available();
    // Prepare the request body
    let request_body = OpenAIEmbeddingRequest {
        model: "text-embedding-3-small".to_string(),
        input: text.to_string(),
    };

    let body_json = match serde_json::to_vec(&request_body) {
        Ok(json) => json,
        Err(e) => return Err(format!("Failed to serialize request: {}", e)),
    };

    let ikey = generate_icp_uuid().await;
    ic_cdk::println!("idempotency_key: {}", ikey.clone().to_string());

    // Create HTTP request
    let response = CanisterHttpRequest::new()
        .url("https://openai.ariwira.me/v1/embeddings")
        .method(HttpMethod::POST)
        .add_headers(vec![
            ("Content-Type".to_string(), "application/json".to_string()),
            ("Authorization".to_string(), format!("Bearer {}", api_key)),
            ("Idempotency-Key".to_string(), ikey.to_string()),
        ])
        .max_response_bytes(1 * 1024 * 1024) // 1MB max response
        .cycles(30_956_296_000)// Adjust cycles as needed
        .payload(Some(body_json))
        .send()
        .await?;

    // Process the response
    if response.status != 200_u16 {
        return Err(format!(
            "OpenAI API error: Status {}, {}",
            response.status,
            str::from_utf8(&response.body).unwrap_or("Invalid UTF-8 response")
        ));
    }

    // Parse the response
    let response_text = match str::from_utf8(&response.body) {
        Ok(text) => text,
        Err(e) => return Err(format!("Failed to decode response: {}", e)),
    };

    let embedding_response: OpenAIEmbeddingResponse = match serde_json::from_str(response_text) {
        Ok(resp) => resp,
        Err(e) => return Err(format!("Failed to parse API response: {}", e)),
    };

    // Extract the embedding vector from the first result
    if embedding_response.data.is_empty() {
        return Err("No embeddings returned from API".to_string());
    }

    Ok(embedding_response.data[0].embedding.clone())
}

/// Extract text content from ByteBuf based on file type
pub fn extract_text_from_bytebuf(data: &ByteBuf, file_type: &str) -> Result<String, String> {
    match file_type.to_lowercase().as_str() {
        "txt" | "text" => {
            match str::from_utf8(data) {
                Ok(text) => Ok(text.to_string()),
                Err(_) => Err("Failed to decode text from file".to_string()),
            }
        },
        "pdf" => {
            match extract_text_from_pdf(data) {
                Ok(text) => Ok(text.to_string()),
                Err(_) => Err("Failed to decode pdf from file".to_string()),
            }
        },
        // Add support for other file types as needed
        _ => Err(format!("Unsupported file type for text extraction: {}", file_type)),
    }
}
