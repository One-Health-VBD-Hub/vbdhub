const NEON_DEFAULT_ROLE = 'neondb_owner';
const NEON_DEFAULT_DB = 'neondb';

// user configurable
const projectId = process.env.NEON_PROJECT_ID;
const neonProductionBranchId = process.env.NEON_PRODUCTION_BRANCH_ID;
const parentBranchToUse = 'production'; // changing this requires `sst remove` first (bug)

const branches = neon.getBranchesOutput({ projectId });
const parentBranchId = branches.apply((result) => {
  const branch = result.branches.find((b) => b.name === parentBranchToUse);
  if (!branch) throw new Error(`${parentBranchToUse} Neon branch not found`);
  return branch.id;
});

// only create a new branch for non-production stages, otherwise use the existing production branch
const branch =
  $app.stage !== 'production'
    ? new neon.Branch(
        `sst-branch-${$app.stage}`,
        {
          projectId,
          name: $app.stage, // "dev", "production", "preview-123"
          // create from specific branch, defaults to `default` tagged branch (in Neon dashboard)
          parentId: $app.stage === 'production' ? undefined : parentBranchId
        },
        {
          protect: $app.protect,
          retainOnDelete: $app.removal === 'retain'
        }
      )
    : { id: neonProductionBranchId };

const endpoint =
  $app.stage !== 'production'
    ? new neon.Endpoint(`sst-endpoint-${$app.stage}`, {
        projectId,
        branchId: branch.id,
        type: 'read_write',
        poolerEnabled: true,
        poolerMode: 'transaction'
      })
    : neon // TODO: this gives non-pooling endpoint!
        .getBranchEndpointsOutput({
          projectId,
          branchId: neonProductionBranchId
        })
        .apply(({ endpoints }) => {
          return endpoints.find((e) => e.type === 'read_write');
        });

// TODO: create per-stage roles only once upstream "unexpected end of JSON input" bug fixed
// const role = new neon.Role(`sst-role-${$app.stage}`, {
//   projectId,
//   branchId: branch.id,
//   name: `sst-role-${$app.stage}`,
// });

// get the password for an existing default role on this branch
const role = neon.getBranchRolePasswordOutput({
  projectId,
  branchId: branch.id,
  roleName: NEON_DEFAULT_ROLE
});

const awsRegion = 'eu-west-2'; // AWS London

// TODO: switch to using `endpoint.host` once bug fixed
const host = $interpolate`${endpoint.id}-pooler.${awsRegion}.aws.neon.tech`;

export const databaseUrl = new sst.Secret(
  `${$app.stage.toUpperCase()}_NEON_DATABASE_URL`,
  $interpolate`postgresql://${role.roleName}:${role.password}@${host}/${NEON_DEFAULT_DB}?sslmode=require&channel_binding=require`
);
