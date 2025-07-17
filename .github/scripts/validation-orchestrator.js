const validationService = require("./validation-service");
const reportGenerator = require("./report-generator");
const ValidationResultManager = require("./validation-result-manager");

class ValidationOrchestrator {
  /**
   * Orchestrates the entire PR validation process.
   * @param {object} prData - The pull request data.
   * @returns {Promise<object>} The final validation result.
   */
  async validate(prData) {
    const resultManager = new ValidationResultManager();

    try {
      // 1. Validate PR title
      const titleValidation = await validationService.validateTitle(
        prData.title,
      );
      resultManager.setDetail("titleValid", titleValidation.isValid);
      resultManager.setDetail("actionType", titleValidation.actionType);
      resultManager.setDetail("domainName", titleValidation.domainName);
      resultManager.setDetail("sld", titleValidation.sld);
      if (!titleValidation.isValid)
        resultManager.addError(titleValidation.error);

      // 2. Validate PR description
      const descriptionValidation = validationService.validatePRDescription(
        prData.body,
      );
      if (!descriptionValidation.isValid)
        resultManager.addError(descriptionValidation.error);

      // 3. Validate file count
      const fileCountValidation = validationService.validateFileCount(
        prData.files,
      );
      if (!fileCountValidation.isValid) {
        resultManager.addError(fileCountValidation.error);
      } else {
        resultManager.setDetail("fileCountValid", true);
      }

      // 4. Validate file path and content
      if (prData.files.length > 0) {
        const file = prData.files[0];
        resultManager.setDetail("fileName", file.filename);

        const filePathValidation = validationService.validateFilePath(file);
        if (!filePathValidation.isValid) {
          resultManager.addError(filePathValidation.error);
        } else {
          resultManager.setDetail("filePathValid", true);
        }

        // 5. Perform action-specific validations
        if (titleValidation.isValid && filePathValidation.isValid) {
          // 新增：新增whois/*.json时校验SLD状态
          if (file.status === 'added') {
            const sldService = require('./sld-service');
            const sldStatus = await sldService.getSLDStatus(titleValidation.sld);
            if (sldStatus !== 'live') {
              resultManager.addError(`The SLD "${titleValidation.sld}" is currently in status "${sldStatus}" and does not allow new domain registrations.`);
            }
          }
          if (titleValidation.actionType === "Remove") {
            const removeValidation =
              await validationService.validateRemoveOperation(
                file,
                titleValidation,
              );
            if (!removeValidation.isValid)
              resultManager.addError(removeValidation.error);
            else resultManager.setDetail("jsonValid", true);
          } else {
            if (["added", "modified"].includes(file.status)) {
              const jsonValidation =
                await validationService.validateJsonContent(file, prData);
              if (!jsonValidation.isValid) {
                resultManager.addError(jsonValidation.error);
              } else {
                resultManager.setDetail("jsonValid", true);
                // Now validate branch name using data from the validated JSON
                const branchValidation = validationService.validateBranchName(
                  prData.branchName,
                  jsonValidation.data.domain,
                  jsonValidation.data.sld,
                );
                if (!branchValidation.isValid) {
                  resultManager.addError(branchValidation.error);
                }
              }
            }
          }

          // 6. Validate title and filename consistency
          const consistencyValidation =
            validationService.validateTitleFileConsistency(
              titleValidation,
              file.filename,
            );
          if (!consistencyValidation.isValid)
            resultManager.addError(consistencyValidation.error);
        }
      } else {
        if (resultManager.isValid()) {
          resultManager.addError("PR must contain at least one file change");
        }
      }

      const report = await reportGenerator.generateValidationReport(
        resultManager.getResult(),
        prData.author,
      );
      resultManager.setReport(report);
    } catch (error) {
      const errorMessage =
        error && error.message
          ? error.message
          : "An unknown error occurred during validation";
      resultManager.addError(`Internal validation error: ${errorMessage}`);
      resultManager.setReport(
        `❌ PR Validation Failed\n\nInternal error occurred during validation: ${errorMessage}`,
      );
    }

    return resultManager.getResult();
  }
}

module.exports = new ValidationOrchestrator();
