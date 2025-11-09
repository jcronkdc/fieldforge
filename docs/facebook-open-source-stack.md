# Facebook Open Source Stack Alignment

MythaTron builds on a broad set of Facebook open source projects. This document captures how each resource fits into our roadmap and the compliance steps we follow.

## Documentation Platform
- **Docusaurus** ([facebook/docusaurus](https://github.com/facebook/docusaurus)) powers the long-form documentation site we intend to spin up (`docs/` will house the content). We will adopt its localization and versioning features when we migrate the current Markdown guides.

## Data & Storage
- **RocksDB** ([facebook/rocksdb](https://github.com/facebook/rocksdb)) is planned for high-throughput story persistence and analytics indexing. We will prototype ingestion adapters before introducing it into production workloads.
- **Zstandard (zstd)** ([facebook/zstd](https://github.com/facebook/zstd)) will be used to compress story archives, engagement logs, and snapshot exports.

## Core Libraries
- **Folly** ([facebook/folly](https://github.com/facebook/folly)) provides reusable C++ components useful for native modules and backend services that need high-performance primitives.
- **Lexical** ([facebook/lexical](https://github.com/facebook/lexical)) is the candidate rich text editor for story authoring on web and native.
- **Flow** ([facebook/flow](https://github.com/facebook/flow)) typechecks our legacy JavaScript surfaces. New code favors TypeScript, but Flow remains relevant for interop.
- **HHVM** ([facebook/hhvm](https://github.com/facebook/hhvm)) is under evaluation for hosting legacy PHP components if we adopt them.

## Mobile & Multimedia
- **Fresco** ([facebook/fresco](https://github.com/facebook/fresco)) is slated for advanced image handling on Android, complementing React Native’s image pipeline.
- **Watchman** ([facebook/watchman](https://github.com/facebook/watchman)) is already leveraged by the React Native toolchain for file watching; ensure it remains installed in dev environments.
- **Stetho** ([facebook/stetho](https://github.com/facebook/stetho)) will be bundled for Android debugging to inspect network traffic and SQLite databases.

## Governance & Contributions
- We comply with the [Facebook Open Source Code of Conduct](https://opensource.fb.com/code-of-conduct/) (`CODE_OF_CONDUCT.md`).
- Contribution flows follow React’s guidance at [legacy.reactjs.org/docs/how-to-contribute.html](https://legacy.reactjs.org/docs/how-to-contribute.html) and our local `CONTRIBUTING.md`.

## Next Steps
1. Stand up a Docusaurus instance for project documentation.
2. Schedule proofs-of-concept for RocksDB storage and Lexical editors.
3. Add automated checks to ensure Watchman, Stetho, and other tooling stay up to date in CI images.

