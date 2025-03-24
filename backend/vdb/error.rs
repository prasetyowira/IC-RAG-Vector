use candid::CandidType;

#[derive(Debug, thiserror::Error, PartialEq, CandidType)]
pub enum Error {
    #[error("Collection already exists")]
    UniqueViolation,
    #[error("Collection not found")]
    NotFound,
    #[error("The dimension of the vector doesn't match the dimension of the collection")]
    DimensionMismatch,
    #[error("User not authorized")]
    Unauthorized,
    #[error("Memory error")]
    MemoryError,
    #[error("invalid input")]
    InvalidInput,
    #[error("file type not supported")]
    FileTypeNotSupported,
    #[error("vector db error")]
    DBError,
}
impl From<Error> for String {
    fn from(error: Error) -> Self {
        error.to_string()
    }
}