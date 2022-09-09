import { AwsCDKClosedApp } from '../src';

test('Trivial', () => {
    const project = new AwsCDKClosedApp({
        defaultReleaseBranch: 'main',
        name: 'dummy',
        cdkVersion: '2.1.0',
    });
    expect(project).toBeInstanceOf(AwsCDKClosedApp);
});