import { Resource } from "sst";
import { task } from 'sst/aws/task';

async function main() {
  // run the selected task locally (change to run a different task)
  await task.run(Resource.SyncVt);
}
void main();
