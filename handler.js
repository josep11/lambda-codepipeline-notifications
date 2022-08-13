const { CodePipelineClient } = require("@aws-sdk/client-codepipeline");
const SNS = require("aws-sdk/clients/sns");
const { ClientWrapper } = require("./ClientWrapper");
const sns = new SNS();

const { TARGET_TOPIC_ARN } = process.env;

const config = {};

exports.handler = async (event, context, callback) => {
	let codePipelineMessage = null;
	if (event.Records && event.Records.length > 0) {
		codePipelineMessage = JSON.parse(event.Records[0].Sns.Message);
	} else {
		// only for dev
		codePipelineMessage = event.detail ? event : null;
	}

	if (!codePipelineMessage) {
		throw new Error("Input error: cannot find code pipeline message");
	}

	const pipelineName = codePipelineMessage.detail.pipeline;

	const client = new CodePipelineClient(config);
	const clientWrapper = new ClientWrapper(client);

	// getting pipeline information
	const { branchName, repository } = await clientWrapper.getPipelineInfo(
		pipelineName
	);

	// getting the last execution of the pipeline
	let { deployState, commitId } =
		await clientWrapper.getPipelineLastExecutionInfo(pipelineName);

	const params = {
		Message: `Deployed branch ${branchName}
        From repository ${repository}
        Commit Id: ${commitId}
        Deploy state is: ${deployState}
        `,
		TopicArn: TARGET_TOPIC_ARN,
		Subject: `Deploy ${deployState}`,
	};

	console.log(params);

	return await sns.publish(params).promise();
};
