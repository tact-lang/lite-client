# TON Lite Client

Low level client for TON blockchain.

## Installation

```bash
yarn add @tact-lang/lite-client
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
