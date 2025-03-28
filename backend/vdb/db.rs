use super::collection::{Collection, DocMetadata, CollectionQuery};
use super::error::Error;
use super::index::Vector;
// use super::memory::Memory;
// use ic_stable_structures::StableBTreeMap;
use instant_distance::Search;
use serde::{Deserialize, Serialize};
use std::{cell::RefCell, collections::HashMap};

thread_local! {
    pub static DB: RefCell<Database> = RefCell::new(Database::new())
}

#[derive(Serialize, Deserialize)]
pub struct Database {
    pub collections: HashMap<String, Collection>,
}

impl Database {
    pub fn new() -> Self {
        Self {
            collections: HashMap::new(),
        }
    }

    pub fn create_collection(&mut self, name: String, dimension: usize) -> Result<(), Error> {
        if self.collections.contains_key(&name) {
            return Err(Error::UniqueViolation);
        }
        let keys: Vec<Vector> = vec![];
        let values: Vec<String> = vec![];

        let collection: Collection = Collection::new(keys, values, dimension);
        self.collections.insert(name, collection);
        Ok(())
    }

    pub fn insert_into_collection(
        &mut self,
        collection_name: &String,
        keys: Vec<Vec<f32>>,
        values: Vec<String>,
        file_name: String,
        title: String,
        file_type: String,
        file_size: u64,
        created_at: u64,
    ) -> Result<(), Error> {
        let collection = self.collections.get_mut(collection_name).ok_or(Error::NotFound)?;

        let mut points: Vec<Vector> = vec![];
        let mut _values: Vec<String> = vec![];

        for i in 0..keys.len() {
            ic_cdk::println!("vali: {}", values[i].clone());
            let key = &keys[i];
            let point = Vector::from((*key).clone());
            points.push(point);
            _values.push(values[i].clone());
        }

        let _ = collection.append(&mut points, &mut _values, file_name, title, file_type, file_size, created_at);
        Ok(())
    }

    pub fn build_index(&mut self, name: &String) -> Result<(), Error> {
        let collection = self.collections.get_mut(name).ok_or(Error::NotFound)?;
        ic_cdk::println!("build index: {}", name.clone());
        collection.build_index();
        Ok(())
    }

    pub fn query(
        &mut self,
        name: &String,
        q: Vec<f32>,
        limit: i32,
    ) -> Result<Vec<(f32, String)>, String> {
        let collection = match self.collections.get(name) {
            Some(value) => value,
            None => return Err(Error::NotFound.to_string()),
        };

        if q.len() != collection.dimension {
            return Err(String::from("query malformed"));
        }

        let mut search = Search::default();
        let v = Vector::from(q);
        let result = collection.query(&v, &mut search, limit);

        Ok(result)
    }

    pub fn delete_collection(&mut self, name: &String) -> Result<(), Error> {
        if let Some(_) = self.collections.remove(name) {
            Ok(())
        } else {
            Err(Error::NotFound)
        }
    }

    pub fn get_all_collections(&self) -> Vec<String> {
        self.collections.iter().map(|(id, _)| id.clone()).collect()
    }

    pub fn get_docs(&mut self, index_name: &String) -> Result<Vec<DocMetadata>, Error> {
        for (key, _) in &self.collections {
            ic_cdk::println!("Collection Key: {}", key.clone());
            ic_cdk::println!("idx: {}", index_name.clone());
            ic_cdk::println!("id eq: {}", index_name.clone() == key.clone());
        }
        let collection = match self.collections.get(index_name) {
            Some(value) => value,
            None => return Err(Error::NotFound),
        };
        ic_cdk::println!("coli: {}", collection.metadata.count.clone());

        // Convert the HashMap values to a Vec
        let mut docs: Vec<DocMetadata> = collection.metadata.docs.values().cloned().collect();
        docs.sort_by_key(|doc| doc.created_at);

        Ok(docs)
    }

    pub fn get_docs_by_query(&mut self, name: &String, query: CollectionQuery) -> Result<Vec<&DocMetadata>, Error> {
        let collection = self.collections.get_mut(name).ok_or(Error::NotFound)?;
        let docs = collection.find(query);
        Ok(docs)
    }

    pub fn remove_document_from_collection(
        &mut self,
        name: &String,
        file_name: &String,
    ) -> Result<(), Error> {
        let collection = self.collections.get_mut(&name.clone()).ok_or(Error::NotFound)?;
        
        // Check if the file exists in the collection
        if !collection.metadata.docs.contains_key(file_name) {
            return Err(Error::NotFound);
        }

        collection.remove(file_name);

        // Rebuild the index
        collection.build_index();
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::{Database, Error, CollectionQuery};

    #[test]
    fn create_collection() {
        let mut db: Database = Database::new();
        let result = db.create_collection("test".to_string(), 3);
        assert!(result.is_ok())
    }

    #[test]
    fn create_duplicate_collection() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        let result = db.create_collection("test".to_string(), 3);
        let expected = Err(Error::UniqueViolation);
        assert_eq!(result, expected);
    }

    #[test]
    fn delete_existing_collection() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        assert_eq!(db.delete_collection(&"test".to_string()), Ok(()))
    }

    #[test]
    fn delete_non_existing_collection() {
        let mut db: Database = Database::new();
        assert_eq!(
            db.delete_collection(&"test".to_string()),
            Err(Error::NotFound)
        )
    }

    #[test]
    fn build_index() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file.txt".to_string(),
            "Test Document".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );
        let result = db.build_index(&"test".to_string());
        assert_eq!(result, Ok(()));
    }

    #[test]
    fn append_and_build_index() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);

        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file1.txt".to_string(),
            "Test Document 1".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );
        let _ = db.build_index(&"test".to_string());

        let keys: Vec<Vec<f32>> = vec![vec![20.0, 20.5, 15.0]];
        let values: Vec<String> = vec!["black".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file2.txt".to_string(),
            "Test Document 2".to_string(),
            "text".to_string(),
            2048,
            1234567891,
        );
        let result = db.build_index(&"test".to_string());
        assert_eq!(result, Ok(()));
    }

    #[test]
    fn delete_collection_with_embeddings() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file.txt".to_string(),
            "Test Document".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );
        let _ = db.build_index(&"test".to_string());
        assert_eq!(db.delete_collection(&"test".to_string()), Ok(()));
    }

    #[test]
    fn insert_into_collection_dimensions_mismatch_keys_values() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);

        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string()];
        let result = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file.txt".to_string(),
            "Test Document".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );

        assert_eq!(result, Err(Error::DimensionMismatch));
    }

    #[test]
    fn test_query_documents() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        
        // Insert test documents
        let keys: Vec<Vec<f32>> = vec![vec![10.0, 12.0, 4.5]];
        let values: Vec<String> = vec!["content1".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "doc1.pdf".to_string(),
            "PDF Document".to_string(),
            "pdf".to_string(),
            1024,
            1234567890,
        );

        // Test query by file type
        let query = CollectionQuery {
            title: None,
            file_name: None,
            file_type: Some("pdf".to_string()),
            date_from: None,
            date_to: None,
        };

        let results = db.get_docs_by_query(&"test".to_string(), query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].file_type.as_ref().unwrap(), "pdf");
    }

    #[test]
    fn test_query_documents_by_date_range() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        
        // Insert documents with different dates
        let keys1: Vec<Vec<f32>> = vec![vec![10.0, 12.0, 4.5]];
        let values1: Vec<String> = vec!["content1".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys1,
            values1,
            "doc1.txt".to_string(),
            "Old Document".to_string(),
            "text".to_string(),
            1024,
            1000000, // Older timestamp
        );

        let keys2: Vec<Vec<f32>> = vec![vec![11.0, 13.0, 5.5]];
        let values2: Vec<String> = vec!["content2".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys2,
            values2,
            "doc2.txt".to_string(),
            "New Document".to_string(),
            "text".to_string(),
            2048,
            2000000, // Newer timestamp
        );

        // Query documents within date range
        let query = CollectionQuery {
            title: None,
            file_name: None,
            file_type: None,
            date_from: Some(1500000),
            date_to: Some(2500000),
        };

        let results = db.get_docs_by_query(&"test".to_string(), query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "New Document");
    }

    #[test]
    fn test_remove_document() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        
        // Insert a test document
        let keys: Vec<Vec<f32>> = vec![vec![10.0, 12.0, 4.5]];
        let values: Vec<String> = vec!["content".to_string()];
        let filename = "test_doc.txt".to_string();
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            filename.clone(),
            "Test Document".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );

        // Remove the document
        let result = db.remove_document_from_collection(&"test".to_string(), &filename);
        assert!(result.is_ok());

        // Verify document was removed
        let docs = db.get_docs(&"test".to_string()).unwrap();
        assert_eq!(docs.len(), 0);
    }

    #[test]
    fn test_query_by_title() {
        let mut db: Database = Database::new();
        let _ = db.create_collection("test".to_string(), 3);
        
        // Insert test document
        let keys: Vec<Vec<f32>> = vec![vec![10.0, 12.0, 4.5]];
        let values: Vec<String> = vec!["content".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "doc.txt".to_string(),
            "Unique Title".to_string(),
            "text".to_string(),
            1024,
            1234567890,
        );

        // Query by title
        let query = CollectionQuery {
            title: Some("Unique Title".to_string()),
            file_name: None,
            file_type: None,
            date_from: None,
            date_to: None,
        };

        let results = db.get_docs_by_query(&"test".to_string(), query).unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].title, "Unique Title");
    }
}
