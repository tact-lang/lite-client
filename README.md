# TON Lite Client

Low level client for TON blockchain.

## Installation

```bash
yarn install @tact-lang/lite-client ton ton-core ton-crypto
```

## Usage

```ts
import { LiteClient } from "@tact-lang/lite-client";
const endpoint = {

};
const client = LiteClient.create([{ host: "localhost", publicKey: "...public key in base64..." }]);
```

## License

MIT
