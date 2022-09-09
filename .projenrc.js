const { cdk, javascript } = require('projen');
const project = new cdk.JsiiProject({
  author: 'Samson Sham',
  authorAddress: '',
  defaultReleaseBranch: 'main',
  name: 'cdk-projen-closed-app',
  repositoryUrl: 'https://github.com/samson-sham/cdk-projen-closed-app.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
  packageManager: javascript.NodePackageManager.PNPM,
  depsUpgrade: false,
  peerDeps: [
    'projen',
  ],
});
project.eslint.addRules({
    '@typescript-eslint/indent': ['error', 4],
});
project.synth();