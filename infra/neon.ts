const NEON_DEFAULT_ROLE = 'neondb_owner';
const NEON_DEFAULT_DB = 'neondb';

// use configurable
const projectId = process.env.NEON_PROJECT_ID;
const parentBranchToUse = 'production'; // changing this requires `sst remove` first (bug)

const branches = neon.getBranchesOutput({ projectId });
const parentBranchId = branches.apply(result => {
  const branch = result.branches.find(b => b.name === parentBranchToUse);
  if (!branch) throw new Error(`${parentBranchToUse} Neon branch not found`);
  return branch.id;
});

const branch = new neon.Branch(`sst-branch-${$app.stage}`, {
  projectId,
  name: $app.stage, // "dev", "production", "preview-123"
  // create from specific branch, defaults to `default` tagged branch (in Neon dashboard)
  parentId: $app.stage === 'production' ? undefined : parentBranchId
});

const endpoint = new neon.Endpoint(`sst-endpoint-${$app.stage}`, {
  projectId,
  branchId: branch.id,
  type: 'read_write',
  poolerEnabled: true,
  poolerMode: 'transaction'
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

export const databaseUrl = new sst.Secret(
  `${$app.stage.toUpperCase()}_NEON_DATABASE_URL`,
  $interpolate`postgresql://${role.roleName}:${role.password}@${endpoint.host}/${NEON_DEFAULT_DB}?sslmode=require&channel_binding=require`
);
