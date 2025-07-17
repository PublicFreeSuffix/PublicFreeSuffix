const fs = require("fs");
const path = require("path");
const logger = require("./logger");

class ValidationReporter {
  /**
   * Log validation results to the console.
   * @param {object} validationResult - The final validation result object.
   * @param {number} prNumber - The pull request number.
   */
  logValidationResult(validationResult, prNumber) {
    if (validationResult.isValid) {
      logger.info(`✅ PR #${prNumber} validation passed`);
      logger.info(`   Action type: ${validationResult.details.actionType}`);
      logger.info(
        `   Domain: ${validationResult.details.domainName}.${validationResult.details.sld}`,
      );
      logger.info(`   File: ${validationResult.details.fileName}`);
    } else {
      logger.error(`❌ PR #${prNumber} validation failed`);
      validationResult.errors.forEach((error, index) => {
        logger.error(`   Error ${index + 1}: ${error}`);
      });
    }
  }

  /**
   * Save validation results to a file.
   * @param {object} validationResult - The final validation result object.
   */
  saveValidationResultToFile(validationResult) {
    try {
      const resultPath = path.join(__dirname, "validation-result.json");
      fs.writeFileSync(resultPath, JSON.stringify(validationResult, null, 2));
      logger.info(`Validation result saved to: ${resultPath}`);
    } catch (error) {
      logger.error("Failed to save validation result:", error);
    }
  }

  /**
   * Handles all reporting tasks for the validation process.
   * @param {object} validationResult - The final validation result object.
   * @param {number} prNumber - The pull request number.
   */
  report(validationResult, prNumber) {
    this.logValidationResult(validationResult, prNumber);
    this.saveValidationResultToFile(validationResult);
  }
}

module.exports = new ValidationReporter();
