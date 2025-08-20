// this file can be run with `npm run shell src/example.ts`

import { Resource } from "sst";
import { Example } from "@vbdhub/core/example";

console.log(`${Example.hello()} Linked to ${Resource.App.name}.`);
