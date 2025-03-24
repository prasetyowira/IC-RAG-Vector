# `ic_rag_vec`
this is project for ICP hackaton, more info: https://codefest.notion.site/

## Project Overview
### Purpose
This project aims to provide a secure, efficient, and decentralized solution for managing knowledge bases using embeddings stored within the Internet Computer Protocol (ICP). Leveraging vector embeddings and Hierarchical Navigable Small World (HNSW) indexing, it enables powerful semantic search and retrieval functionality, enhancing the capabilities of Retrieval-Augmented Generation (RAG) systems directly on-chain.

### Target Audience
The primary target audience includes:
- Developers and organizations interested in decentralized storage and retrieval of knowledge bases.

- Teams building Retrieval-Augmented Generation (RAG) applications.

- Researchers and enthusiasts exploring the intersection of blockchain technology, decentralized computing (ICP), and AI/ML embedding models.

### Project Information
This project is built on the Internet Computer Protocol (ICP) platform using Rust and leverages various technologies and libraries:

ICP (Internet Computer Protocol): Decentralized computing platform providing scalable smart contract execution.

Rust & IC-CDK: Efficient backend programming language with robust support for ICP canister development.

HNSW: Advanced indexing for vector embeddings, enabling fast semantic search.

OpenAI Embedding (rag-toolchain): Integration with OpenAI APIs for generating accurate vector embeddings.

Stable Memory (ic-stable-structures): Persistent, scalable storage solution provided by ICP, enabling the handling of large datasets up to 500 GB per canister.

This combination ensures scalability, reliability, and performance, positioning the project uniquely at the intersection of blockchain decentralization and cutting-edge AI.

## Tech Stack
- Frontend: React with Vite and Tailwind CSS, deployed as a dedicated frontend canister on-chain for seamless integration with the ICP backend.

- Backend: Rust and IC-CDK for backend logic, storage, and embedding handling.

- Indexing & Search: HNSW vector indexing for efficient semantic search.

- Embedding Generation: OpenAI API via rag-toolchain integration.

- Storage: ICP Stable Memory for persistent and large-scale data management.

This combination ensures scalability, reliability, and performance, positioning the project uniquely at the intersection of blockchain decentralization and cutting-edge AI


## Core Features and Areas

### 1. CRUD Knowledge Base
- **Purpose**: Store and manage knowledge bases as vector embeddings.
- **Core functionality**: Add, read, update, and delete document embeddings.
- **Technical requirements**: ICP stable memory, HNSW indexing, Rust backend.
- **User interactions**: Web interface for uploading documents, editing metadata, and managing embeddings.

### 2. Semantic Search
- **Purpose**: Retrieve relevant information efficiently from knowledge bases.
- **Core functionality**: Perform semantic searches using vector embeddings.
- **Technical requirements**: HNSW indexing, vector search algorithms.
- **User interactions**: Search bar and result interface displaying relevant documents.

### 3. Simple Chat Client
- **Purpose**: Allow users to interact naturally with stored knowledge bases.
- **Core functionality**: Chat interface to ask questions and receive contextual answers based on stored embeddings.
- **Technical requirements**: Integration with OpenAI or similar LLM APIs, React frontend.
- **User interactions**: Real-time chat interface with input box and conversational response display.

## Development Guidelines

### Frontend (`src/ic_rag_vec_frontend`)
Frontend built with React + Vite + Tailwind CSS (max 2000 lines of TSX code), hosted entirely in an ICP canister.

- **Component Structure and Organization**
  - Follow atomic design principles (Atoms, Molecules, Organisms, Pages).
  - Maintain clean component hierarchy with clear naming conventions (PascalCase for components).
  - Separate UI logic from business logic.

- **State Management Approach**
  - Prefer React built-in hooks (`useState`, `useEffect`, `useReducer`) for simple state.
  - Use Zustand or Redux Toolkit for global state management if complexity grows.

- **Routing Conventions**
  - Use React Router v6 for clean and maintainable client-side routing.
  - Clearly defined and structured routes in a central configuration file.

- **Asset Management**
  - Store static assets (images, icons, fonts) within `/src/ic_rag_vec_frontend/public/assets`.
  - Prefer SVGs for icons and small graphics for performance optimization.

- **Performance Optimization Techniques**
  - Lazy load heavy components/pages using React.lazy and Suspense.
  - Minimize unnecessary re-renders using memoization (`useMemo`, `React.memo`).
  - Optimize bundle size with code-splitting and tree shaking (via Vite).

---

### Backend (`src/ic_rag_vec_backend`, `src/ic_rag_vec_macros`)
Backend written in Rust, compiled to `wasm32-unknown-unknown`, running within a single ICP canister.

- **API Design Principles**
  - Follow RESTful or RPC conventions clearly and consistently.
  - Use clear, concise, and descriptive endpoint naming (`upload_file`, `chat`, etc.).
  - Maintain consistent serialization/deserialization using Candid.

- **Error Handling Standards**
  - Standardize custom error types using Rust’s `Result` and custom enums.
  - Consistently return meaningful error messages to frontend consumers.
  - Implement comprehensive logging for debugging purposes.

- **Database Schema Conventions**
  - Use clearly defined structures for embedding storage and metadata.
  - Leverage `ic-stable-structures` for persistence with defined schema.
  - Maintain versioned schemas for ease of upgrade and migration.

- **Security Measures**
  - Use secure authorization and ownership verification macros (`check_authorization`, `check_is_owner`).
  - Strictly validate and sanitize all input data.
  - Clearly define canister access controls and ICP principals.

## ICP
- [Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)
- [SDK Developer Tools](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust Canister Development Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)
- [ic-cdk](https://docs.rs/ic-cdk)
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)
- [Candid Introduction](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)

If you want to start working on your project right away, you might want to try the following commands:

```bash
cd ic_rag_vec/
dfx help
dfx canister --help
```

## Running the project locally

If you want to test your project locally, you can use the following commands:

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys your canisters to the replica and generates your candid interface
dfx deploy
```

Once the job completes, your application will be available at `http://localhost:4943?canisterId={asset_canister_id}`.

If you have made changes to your backend canister, you can generate a new candid interface with

```bash
npm run generate
```

at any time. This is recommended before starting the frontend development server, and will be run automatically any time you run `dfx deploy`.

If you are making frontend changes, you can start a development server with

```bash
npm start
```

Which will start a server at `http://localhost:8080`, proxying API requests to the replica at port 4943.

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor
