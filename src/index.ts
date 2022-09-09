import * as fs from 'fs';
import { javascript } from 'projen';
import { AwsCdkTypeScriptApp, AwsCdkTypeScriptAppOptions } from 'projen/lib/awscdk';
import { ReleaseTrigger } from 'projen/lib/release';

export class AwsCDKClosedApp extends AwsCdkTypeScriptApp {
    constructor(options: AwsCdkTypeScriptAppOptions) {
        super({
            ...options,
            packageManager: javascript.NodePackageManager.PNPM,
            depsUpgrade: false,
            gitignore: [
                '.DS_Store',
            ],
            release: true,
            releaseTrigger: ReleaseTrigger.manual(),
        });
        this.eslint?.addRules({
            '@typescript-eslint/indent': ['error', 4],
        });

        const loginTask = this.addTask('login', { exec: 'AWS_PROFILE=sso ./refreshCredentials.sh' });
        this.cdkTasks.deploy.reset();
        this.cdkTasks.deploy.spawn(loginTask);
        this.cdkTasks.deploy.exec('cdk deploy --profile sso --require-approval never --outputs-file cdk-output.json');
        this.cdkTasks.destroy.reset();
        this.cdkTasks.destroy.spawn(loginTask);
        this.cdkTasks.destroy.exec('cdk destroy --profile sso --force && rm cdk-output.json');
        this.preCompileTask.spawn(loginTask);
        this.packageTask.spawn(this.cdkTasks.deploy);

        const shellFile = 'refreshCredentials.sh';
        const shellCode = `#!/usr/bin/env bash

# This script generates AWS Programmatic Access credentials from a user authenticated via SSO
# Before using, make sure that the AWS SSO is configured in your CLI: \`aws configure sso\`

profile=\${AWS_PROFILE}
prepare() {
    temp_identity=$(aws --profile "$profile" sts get-caller-identity)
    account_id=$(echo $temp_identity | jq -r .Arn | cut -d: -f5)
    assumed_role_name=$(echo $temp_identity | jq -r .Arn | cut -d/ -f2)
    session_name=$(echo $temp_identity | jq -r .Arn | cut -d/ -f3)
    sso_region=$(aws --profile "$profile" configure get sso_region)
}

prepare

if [[ $sso_region == 'us-east-1' ]]; then 
    sso_region_string=''
else
    sso_region_string="\${sso_region}/"
fi
role_arn="arn:aws:iam::\${account_id}:role/aws-reserved/sso.amazonaws.com/\${sso_region_string}\${assumed_role_name}"


request_credentials() {
    credentials=$(
    aws sts assume-role \
        --profile $profile \
        --role-arn $role_arn \
        --role-session-name $session_name
    )
}

echo "=> requesting temporary credentials"
request_credentials

if [ $? -ne 0 ]; then
    aws sso login --profile "$profile"

    if [ $? -ne 0 ]; then
    exit 1
    fi

    prepare
    request_credentials
fi

echo "=> updating ~/.aws/credentials as profile $profile"

access_key_id=$(echo $credentials | jq -r .Credentials.AccessKeyId)
secret_access_key=$(echo $credentials | jq -r .Credentials.SecretAccessKey)
session_token=$(echo $credentials | jq -r .Credentials.SessionToken)

aws configure set --profile "$profile" aws_access_key_id "$access_key_id"
aws configure set --profile "$profile" aws_secret_access_key "$secret_access_key"
aws configure set --profile "$profile" aws_session_token "$session_token"

echo "[OK] done"
`;

        fs.writeFileSync(shellFile, shellCode);
        fs.chmodSync(shellFile, 0o555);
    }
}