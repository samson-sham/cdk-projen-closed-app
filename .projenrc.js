const { cdk, javascript } = require('projen');
const { ReleaseTrigger } = require('projen/lib/release');
const project = new cdk.JsiiProject({
    author: 'Samson Sham',
    authorAddress: '',
    copyrightOwner: 'Samson Sham',
    copyrightPeriod: '2022',
    defaultReleaseBranch: 'main',
    name: 'cdk-projen-closed-app',
    repositoryUrl: 'https://github.com/samson-sham/cdk-projen-closed-app.git',

    // deps: [],                /* Runtime dependencies of this module. */
    // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
    // devDeps: [
    //     'projen@^0.x',
    // ],             /* Build dependencies for this module. */
    // packageName: undefined,  /* The "name" in package.json. */
    packageManager: javascript.NodePackageManager.PNPM,
    buildWorkflow: false,
    depsUpgrade: false,
    peerDeps: [
        'projen',
    ],
    releaseTrigger: ReleaseTrigger.manual(),
});
// project.addPeerDeps('projen');
project.eslint.addRules({
    '@typescript-eslint/indent': ['error', 4],
});
project.packageTask.exec('pnpm publish --no-git-checks');

new javascript.UpgradeDependencies(project, {
    // include: ['projen'],
    taskName: 'upgrade-npms',
    workflow: false, // or true
    // workflowOptions: { ... }
});

project.synth();