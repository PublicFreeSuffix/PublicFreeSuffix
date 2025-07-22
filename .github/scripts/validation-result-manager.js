const logger = require("./logger");

class ValidationResultManager {
  constructor() {
    this.result = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {
        titleValid: false,
        fileCountValid: false,
        filePathValid: false,
        jsonValid: false,
        actionType: null,
        domainName: null,
        sld: null,
        fileName: null,
      },
      report: "",
    };
  }

  addError(error) {
    if (error) {
      this.result.errors.push(error);
      this.result.isValid = false;
    } else {
      logger.warn("Attempted to add null/undefined error");
    }
  }

  addWarning(warning) {
    if (warning) {
      this.result.warnings.push(warning);
    } else {
      logger.warn("Attempted to add null/undefined warning");
    }
  }

  setDetail(key, value) {
    if (key in this.result.details) {
      this.result.details[key] = value;
    } else {
      logger.warn(`Attempted to set unknown detail key: ${key}`);
    }
  }

  setReport(report) {
    this.result.report = report;
  }

  getResult() {
    return this.result;
  }

  isValid() {
    return this.result.isValid;
  }
}

module.exports = ValidationResultManager;
