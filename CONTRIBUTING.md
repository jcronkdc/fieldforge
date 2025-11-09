# Contributing Guidelines

Thanks for your interest in contributing to MythaTron!

## Code of Conduct

All participants must follow the [Facebook Open Source Code of Conduct](https://opensource.fb.com/code-of-conduct/). Please review it before engaging with the project. Questions or reports can be sent to `conduct@mythatron.com`.

## Getting Started

1. Clone the repository and initialize submodules:
   ```sh
   git clone https://github.com/jcronkdc/greatest.git
   cd greatest
   git submodule update --init --recursive
   ```
2. Review the project overview in `README.md` and the native workspace docs in `MythaTronNative/README.md`.
3. Familiarize yourself with the React contribution workflow outlined in [React’s How to Contribute guide](https://legacy.reactjs.org/docs/how-to-contribute.html).

## Development Stack

We leverage Facebook’s open-source ecosystem:

- `react-native/` submodule for native app runtime.
- `MythaTronNative/` React Native CLI scaffold (0.82.1).
- Open Graph tooling under `tools/opengraph/` for social metadata validation.

See `docs/facebook-open-source-stack.md` for a full list of upstream projects and integration notes.

## Pull Requests

- Fork the repository and create a feature branch.
- Ensure all linting/tests pass:
  ```sh
  npm test
  ```
  (Add additional platform-specific steps where relevant.)
- Provide context in your PR description and link related issues.
- Confirm your changes respect the Code of Conduct and any upstream license requirements.

## Reporting Issues

Please include:

- Environment details (OS, Node version, Expo/React Native versions).
- Steps to reproduce.
- Screenshots or logs when possible.

Thank you for helping to make MythaTron better!

