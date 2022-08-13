const STAGE_SOURCE = "Source";
const STAGE_DEPLOY = "Deploy";

const {
	GetPipelineCommand,
	ListPipelineExecutionsCommand,
} = require("@aws-sdk/client-codepipeline");

class ClientWrapper {
	constructor(client) {
		this.client = client;
	}

	async getPipelineInfo(pipelineName) {
		// getting pipeline information
		const input = {
			name: pipelineName,
		};
		const command = new GetPipelineCommand(input);
		const response = await this.client.send(command);
		const stages = response.pipeline.stages;

		const sourceStage = stages.filter((stage) => stage.name == STAGE_SOURCE)[0];

		if (!sourceStage.actions || !sourceStage.actions.length) {
			throw "No actions";
		}

		console.log(sourceStage.actions);

		const branchName = sourceStage.actions[0].configuration.BranchName;
		const repository = sourceStage.actions[0].configuration.FullRepositoryId;

		return {
			branchName,
			repository,
		};
	}

	async getPipelineLastExecutionInfo(pipelineName) {
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

		const { status, sourceRevisions } =
			pipelineExecutionSummaries[0];

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

module.exports = {
    ClientWrapper
};
