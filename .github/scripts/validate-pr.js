const PRValidatorController = require("./pr-validator-controller");
const logger = require("./logger");

// Main execution function
async function main() {
  try {
    logger.info("Starting PR validation...");
    const controller = new PRValidatorController();
    const result = await controller.validatePullRequest();

    if (result.isValid) {
      logger.info("✅ All validations passed");
      process.exit(0);
    } else {
      logger.error("❌ Validation failed");
      process.exit(1);
    }
  } catch (error) {
    logger.error("Validation process failed:", error);
    process.exit(1);
  }
}

// If running this script directly
if (require.main === module) {
  main();
}
