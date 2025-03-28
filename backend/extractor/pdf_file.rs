use lopdf::Document;
use crate::vdb::error::Error;

pub fn extract_text_from_pdf(pdf_bytes: &[u8]) -> Result<String, Error> {
    let doc = match Document::load_mem(pdf_bytes) {
        Ok(doc) => doc,
        Err(_) => return Err(Error::FileTypeNotSupported),
    };

    let mut full_text = String::new();

    for page in doc.get_pages() {
        let text = doc.extract_text(&[page.0]);
        full_text.push_str(text.unwrap().as_str());
    }
    ic_cdk::println!("full_text: {}", full_text.clone().as_str());

    Ok(full_text)
}