build-CodepipelineNotificationFunction:
	npm install
# workaround https://github.com/aws/aws-sam-cli/issues/2565
	npm rebuild
# npm run lint
	npm run build
	npm prune --production
ifeq ($(OS),Windows_NT)
	Xcopy /E dist common $(ARTIFACTS_DIR)
else
	cp -r dist common $(ARTIFACTS_DIR)
endif
# copy deps
# ifeq ($(OS),Windows_NT)
# 	Xcopy /E node_modules $(ARTIFACTS_DIR)
# else
# 	cp -r node_modules $(ARTIFACTS_DIR)/dist
# endif


build-RuntimeDependenciesLayer:
	mkdir -p "$(ARTIFACTS_DIR)/nodejs"
	cp package.json package-lock.json "$(ARTIFACTS_DIR)/nodejs/"
	npm install --production --prefix "$(ARTIFACTS_DIR)/nodejs/"
	rm "$(ARTIFACTS_DIR)/nodejs/package.json" # to avoid rebuilding when changes don't relate to dependencies
