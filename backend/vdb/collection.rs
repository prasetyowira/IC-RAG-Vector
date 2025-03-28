use super::index::{generate_index, Vector};
use candid::{CandidType};
use ciborium::de;
use ic_stable_structures::{storable::Bound, Storable};
use instant_distance::{HnswMap, Search};
use serde::{Deserialize, Serialize};
use std::borrow::Cow;
use std::clone::Clone;
use std::{collections::HashMap, usize};

#[derive(CandidType, Clone, Serialize, Deserialize, Hash, Eq, PartialEq, Debug)]
pub struct DocMetadata {
    pub title: String,
    pub file_name: String,
    pub file_type: Option<String>,
    pub file_size: u64,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    pub docs: HashMap<String, DocMetadata>,
    pub count: u64,
    pub created_at: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Collection {
    pub dimension: usize,
    pub metadata: Metadata,
    inner: HnswMap<Vector, String>,
    keys: Vec<Vector>,
    values: Vec<String>,
}

#[derive(Deserialize, Clone)]
pub struct CollectionQuery {
    pub title: Option<String>,
    pub file_name: Option<String>,
    pub file_type: Option<String>,
    pub date_from: Option<u64>,
    pub date_to: Option<u64>,
}

impl Storable for Collection {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        let mut bytes = vec![];
        ciborium::ser::into_writer(self, &mut bytes).unwrap();
        Cow::Owned(bytes)
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        let canister_wasm: Collection = de::from_reader(bytes.as_ref()).unwrap();
        canister_wasm
    }

    const BOUND: Bound = Bound::Unbounded;
}

impl Collection {
    pub fn new(keys: Vec<Vector>, values: Vec<String>, dimension: usize) -> Self {
        Collection {
            keys: keys.clone(),
            values: values.clone(),
            inner: generate_index(keys, values),
            dimension,
            metadata: Metadata {
                count: 0,
                created_at: ic_cdk::api::time(),
                docs: HashMap::new(),
            },
        }
    }

    // Method baru untuk mencari dokumen berdasarkan metadata
    pub fn find(&self, query: CollectionQuery) -> Vec<&DocMetadata> {
        let mut results = Vec::new();

        for (file_name, doc_metadata) in &self.metadata.docs {
            // Check if all the specified query conditions match
            if query.title.is_some() && &doc_metadata.title != query.title.as_ref().unwrap() {
                continue;
            }
            if query.file_name.is_some() && file_name != query.file_name.as_ref().unwrap() {
                continue;
            }
            if query.file_type.is_some() && doc_metadata.file_type.as_ref() != query.file_type.as_ref() {
                continue;
            }
            if query.date_from.is_some() && doc_metadata.created_at < query.date_from.unwrap() {
                continue;
            }
            if query.date_to.is_some() && doc_metadata.created_at > query.date_to.unwrap() {
                continue;
            }

            // Add a reference to the matching document
            results.push(doc_metadata);
        }

        results
    }

    pub fn append(
        &mut self,
        keys: &mut Vec<Vector>,
        values: &mut Vec<String>,
        file_name: String,
        title: String,
        file_type: String,
        file_size: u64,
        created_at: u64,
    ) -> Result<(), String> {
        let f_name = file_name.clone();
        self.keys.append(keys);
        ic_cdk::println!("keys append");
        self.values.append(values);
        ic_cdk::println!("values append");
        let docs_metadata = DocMetadata {
            title,
            file_name,
            file_type: Some(file_type),
            file_size,
            created_at,
        };
        self.metadata.docs.insert(f_name, docs_metadata);
        ic_cdk::println!("meta inserted");
        self.metadata.count += 1;
        ic_cdk::println!("meta count incremented");

        Ok(())
    }

    pub fn query(&self, key: &Vector, search: &mut Search, limit: i32) -> Vec<(f32, String)> {
        let mut res: Vec<(f32, String)> = vec![];
        let mut iter = self.inner.search(key, search);
        for _ in 0..limit {
            match iter.next() {
                Some(v) => res.push((v.point.cos_sim(key), (*v.value).clone())),
                None => break,
            }
        }

        res
    }
    pub fn build_index(&mut self) {
        self.inner = generate_index(self.keys.clone(), self.values.clone())
    }

    // Method to remove all vectors associated with a file
    pub fn remove(&mut self, file_name: &String) -> Result<(), String> {
        ic_cdk::println!("file_name: {}", &file_name.clone());
        ic_cdk::println!("vv: {:?}", self.values.clone());

        for item in self.values.clone() {
            ic_cdk::println!("item: {}", &item.clone());
        }
        
        // Remove from metadata
        self.metadata.docs.remove(file_name);
        Ok(())
    }
}
