import { CodePipelineClient } from "@aws-sdk/client-codepipeline";
import { ClientWrapper } from "./ClientWrapper";
import { SNS } from "@aws-sdk/client-sns";
import { SNSEvent } from "./common/sns-event";
import { CodePipelineExecutionStateChange } from "./common/CodePipelineExecutionStateChange";
const sns = new SNS({});

const { TARGET_TOPIC_ARN } = process.env;

const config = {};

export const handler = async (event: SNSEvent) => {
	if (!event.Records || !event.Records.length) {
		throw new Error("Input error: cannot find code pipeline message");
	}
	
	const codePipelineMessage: CodePipelineExecutionStateChange = JSON.parse(event.Records[0].Sns.Message);

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

	return await sns.publish(params);
};
