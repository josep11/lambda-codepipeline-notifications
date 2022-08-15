.PHONY: build-RuntimeDependenciesLayer build-lambda-common

sam/watch:
	sam sync --stack-name $(shell basename $(shell pwd)) --watch

sam/deploy:
	sam build
	sam deploy --no-confirm-changeset

build-lambda-common:
	npm install
	npm rebuild
	rm -rf dist
	echo "{\"extends\": \"./tsconfig.json\", \"include\": [\"${HANDLER}\"] }" > tsconfig-only-handler.json
	npm run build -- --build tsconfig-only-handler.json
# 	npm prune --production # TODO: think wether to use it
	cp -r dist "$(ARTIFACTS_DIR)/"

build-CodepipelineNotificationFunction:
	$(MAKE) HANDLER=handler.ts build-lambda-common

build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes don't relate to dependencies
