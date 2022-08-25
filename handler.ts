import { CodePipelineClient } from "@aws-sdk/client-codepipeline";
import { ClientWrapper } from "./ClientWrapper";
import { SNS } from "@aws-sdk/client-sns";
import { SNSEvent } from "./common/sns-event";
import { CodePipelineExecutionStateChange } from "./common/CodePipelineExecutionStateChange";
const sns = new SNS({});

const { TARGET_TOPIC_ARN, REPO_BASE_URL } = process.env;

const config = {};

export const handler = async (event: SNSEvent) => {
	if (!event.Records || !event.Records.length) {
		throw new Error("Input error: cannot find code pipeline message");
	}

	let codePipelineMessage: CodePipelineExecutionStateChange;
	try {
		codePipelineMessage = JSON.parse(event.Records[0].Sns.Message);
	} catch (err) {
		console.error("Error parsing SNS message");
		console.log(event);
		console.error(err);
		return;
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

	const branchURL = `${REPO_BASE_URL}/${repository}/branch/${branchName}`;
	const commitURL = `${REPO_BASE_URL}/${repository}/commits/${commitId}`;

	const params = {
		Message: `Deployed branch: <a href="${branchURL}">${branchName}</a>
From repository: ${repository}
Commit Id: <a href="${commitURL}">${commitId}</a>
Deploy state is: ${deployState}
        `,
		TopicArn: TARGET_TOPIC_ARN,
		Subject: `Deploy ${deployState}`,
	};

	console.log(params);

	return await sns.publish(params);
};
