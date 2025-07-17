const logger = require("./logger");
const validationOrchestrator = require("./validation-orchestrator");
const validationReporter = require("./validation-reporter");
const prService = require("./pr-service");

class PRValidatorController {
  constructor() {
    if (!process.env.MY_GITHUB_TOKEN) {
      logger.error(
        "MY_GITHUB_TOKEN environment variable is required but not set",
      );
      throw new Error(
        "MY_GITHUB_TOKEN environment variable is required but not set",
      );
    }
  }

  /**
   * Main validation function
   */
  async validatePullRequest() {
    logger.info("🔍 Starting PR validation process");

    const prData = await prService.getPRDataFromEnv();
    const result = await validationOrchestrator.validate(prData);

    validationReporter.report(result, prData.number);

    return result;
  }
}

module.exports = PRValidatorController;
