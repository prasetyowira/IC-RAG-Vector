use super::collection::{Collection, DocMetadata};
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

// #[derive(Serialize, Deserialize)]
// pub struct Database {
//     #[serde(skip, default = "init_stable_data")]
//     pub collections: StableBTreeMap<String, Collection, Memory>,
// }

// fn init_stable_data() -> StableBTreeMap<String, Collection, Memory> {
//     StableBTreeMap::init(super::memory::get_stable_btree_memory())
// }

// impl Default for Database {
//     fn default() -> Self {
//         Self {
//             collections: init_stable_data(),
//         }
//     }
// }

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

        if keys.len() != values.len() {
            return Err(Error::DimensionMismatch);
        }

        let all_same_length = keys.iter().all(|inner| inner.len() == collection.dimension);

        if !all_same_length {
            return Err(Error::DimensionMismatch);
        }

        let mut points: Vec<Vector> = vec![];
        let mut _values: Vec<String> = vec![];

        for i in 0..keys.len() {
            let key = &keys[i];
            if key.len() != collection.dimension {
                continue;
            }
            let point = Vector::from((*key).clone());
            points.push(point);
            _values.push(values[i].clone());
        }

        let _ = collection.append(&mut points, &mut _values, file_name, title, file_type, file_size, created_at);
        Ok(())
    }

    pub fn build_index(&mut self, name: &String) -> Result<(), Error> {
        let collection = self.collections.get_mut(name).ok_or(Error::NotFound)?;

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
        let collection = match self.collections.get(index_name) {
            Some(value) => value,
            None => return Err(Error::NotFound),
        };

        if collection.metadata.docs.is_empty() {
            return Err(Error::NotFound);
        }

        // Convert the HashSet to a sorted Vec for consistent ordering across calls
        let mut docs: Vec<DocMetadata> = Vec::from_iter(collection.metadata.docs.clone());
        docs.sort_by_key(|doc| doc.created_at);

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

        collection.remove(file_name).unwrap();
        
        // Rebuild the index
        collection.build_index();
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::{Database, Error};

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
            "test_file_name".to_string(),
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
            "test_file_name".to_string(),
        );
        let _ = db.build_index(&"test".to_string());

        let keys: Vec<Vec<f32>> = vec![vec![20.0, 20.5, 15.0]];
        let values: Vec<String> = vec!["black".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file_name".to_string(),
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
            "test_file_name".to_string(),
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
            "test_file_name".to_string(),
        );

        assert_eq!(result, Err(Error::DimensionMismatch));
    }

    #[test]
    fn insert_into_collection_dimensions_mismatch_keys() {
        let mut db: Database = Database::new();

        let _ = db.create_collection("test".to_string(), 3);

        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0, 10.2],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];
        let result = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file_name".to_string(),
        );

        assert_eq!(result, Err(Error::DimensionMismatch));
    }

    #[test]
    fn insert_into_collection_dimensions_mismatch() {
        let mut db: Database = Database::new();

        let _ = db.create_collection("test".to_string(), 4);

        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];
        let result = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file_name".to_string(),
        );

        assert_eq!(result, Err(Error::DimensionMismatch));
    }

    #[test]
    fn insert_into_non_existing_collection() {
        let mut db: Database = Database::new();

        let keys: Vec<Vec<f32>> = vec![
            vec![10.0, 12.0, 4.5],
            vec![10.0, 11.0, 10.5],
            vec![10.0, 20.5, 15.0],
        ];
        let values: Vec<String> = vec!["red".to_string(), "green".to_string(), "blue".to_string()];

        let result = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file_name".to_string(),
        );

        assert_eq!(result, Err(Error::NotFound));
    }

    #[test]
    fn query() {
        let mut db = Database::new();
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
            "test_file_name".to_string(),
        );

        let _ = db.build_index(&"test".to_string());

        let query_vec: Vec<f32> = vec![10.0, 12.5, 4.5];
        let result = db.query(&"test".to_string(), query_vec, 1);
        assert_eq!(result, Ok(vec![(0.9997943, "red".to_string())]));
    }

    #[test]
    fn query_with_append() {
        let mut db = Database::new();
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
            "test_file_name".to_string(),
        );

        let _ = db.build_index(&"test".to_string());

        let keys: Vec<Vec<f32>> = vec![vec![10.0, 12.0, 16.5], vec![10.0, 30.0, 40.5]];
        let values: Vec<String> = vec!["yellow".to_string(), "happy".to_string()];
        let _ = db.insert_into_collection(
            &"test".to_string(),
            keys,
            values,
            "test_file_name".to_string(),
        );

        let _ = db.build_index(&"test".to_string());

        let query_vec: Vec<f32> = vec![10.0, 30.5, 35.5];
        let result = db.query(&"test".to_string(), query_vec, 1);
        assert_eq!(result, Ok(vec![(0.9973914, "happy".to_string())]));
    }
}
