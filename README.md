# lambda-codepipeline-notifications

This function is a consumer to the SNS Topic that is invoked after a Pipeline Failed/Canceled/Succeeded. It will process the message and with the pipeline name will check to which branch it is tied to, which commit, etc and sends the summary to a target SNS topic for releases.

Essentially it sits between two SNS topics where the target topic is front facing that can be hooked to email/AWS Chatbot (for slack).

The SAM template will run and create the infrastructure for us.

To hook it propperly you should go to a particular CodePipeline Pipeline and click "Create notification rule", check the triggers you want (eg: Succeeded, etc) and then select the "Notification rule targets" to be SNS Topic and select the ARN of the `codepipeline-build-topic`.

## Develop

Install dependencies:

```bash
npm install
```

Sync the lambda code in AWS while developing:

```bash
sam sync --stack-name $(basename $(pwd)) --watch
```

## Deploy to production

TODO: build ts as part of sam build

```bash
sam build
sam deploy -g
```

## Other resources

```bash
aws codepipeline list-pipeline-executions --pipeline-name addevent-legacy-apstaging | jq .
```

## SNS Topic names

### codepipeline-build-topic

It is the topic where codepipeline hooks to after its execution.
It is configured by going to the pipeline and setting the ARN of this topic in the notifications options.

### codepipeline-results

It is the front facing topic where the lambda function will publish the summary to. It will look like something like this:

```text
Deployed branch feature/new-feature
From repository josepalsina/reponame
Commit Id: d59030ee56f620e23aa4243b50fc3d40e125185b
Deploy state is: Succeeded
```
