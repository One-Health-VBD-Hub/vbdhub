import { Resource } from "sst";
import { Example } from "@vbdhub/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);
