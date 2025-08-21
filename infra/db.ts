export const database = new sst.Linkable('Database', {
  properties: {
    // set per-stage with `sst secret set DatabaseUrl ...`
    url: new sst.Secret('NeonDbUrl').value
  }
});
