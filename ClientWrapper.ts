const STAGE_SOURCE = "Source";
const STAGE_DEPLOY = "Deploy";

import {
	CodePipelineClient,
	GetPipelineCommand,
	GetPipelineCommandOutput,
	ListPipelineExecutionsCommand,
} from "@aws-sdk/client-codepipeline";

export class ClientWrapper {
	client: CodePipelineClient;

	constructor(client: CodePipelineClient) {
		this.client = client;
	}

	async getPipelineInfo(pipelineName: string) {
		// getting pipeline information
		const input = {
			name: pipelineName,
		};
		const command = new GetPipelineCommand(input);
		const response: GetPipelineCommandOutput = await this.client.send(command);
		const stages = response?.pipeline?.stages;

		let sourceStage = stages?.filter((stage) => stage.name == STAGE_SOURCE)[0];

		if (!sourceStage || !sourceStage.actions || !sourceStage.actions.length) {
			throw "No actions";
		}
		
		console.log(sourceStage.actions);

		const branchName = sourceStage?.actions[0].configuration?.BranchName;
		const repository = sourceStage?.actions[0].configuration?.FullRepositoryId;

		return {
			branchName,
			repository,
		};
	}

	async getPipelineLastExecutionInfo(pipelineName: string) {
		// getting pipeline information
		const input = {
			pipelineName,
		};
		const command = new ListPipelineExecutionsCommand(input);
		const response = await this.client.send(command);

		const { pipelineExecutionSummaries } = response;
		if (!pipelineExecutionSummaries) {
			throw new Error("There are no pipeline executions so far");
		}

		const { status, sourceRevisions } = pipelineExecutionSummaries[0];

		const commitId =
			sourceRevisions && sourceRevisions.length
				? sourceRevisions[0].revisionId
				: null;

		return {
			deployState: status,
			commitId,
		};
	}
}