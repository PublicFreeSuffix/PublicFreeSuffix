const config = require("./config");
const sldService = require("./sld-service");
const githubService = require("./github-service");
const validationService = require("./validation-service");
const reportGenerator = require("./report-generator");
const ValidationResultManager = require("./validation-result-manager");

const TRANSITION_ENABLED = !!(config.transition && config.transition.enabled);

class ValidationOrchestrator {
  /**
   * Orchestrates the entire PR validation process.
   * @param {object} prData - The pull request data.
   * @returns {Promise<object>} The final validation result.
   */
  async validate(prData) {
    if (TRANSITION_ENABLED) {
      return this.validateTransition(prData);
    }
    return this.validateFull(prData);
  }

  /**
   * Transitional validation (transition period):
   * A PR is approved when it passes only two checks:
   *   1. The domain uses a supported sTLD
   *   2. The domain is not duplicated (not on main, not pending in another open PR)
   * Approved PRs are merged MANUALLY by a maintainer — nothing is merged automatically.
   * @param {object} prData - The pull request data.
   * @returns {Promise<object>} The final validation result.
   */
  async validateTransition(prData) {
    const resultManager = new ValidationResultManager();

    try {
      // Precondition: identify the application — exactly one whois/*.json change
      if (prData.files.length !== 1) {
        resultManager.addError(
          `Transitional validation requires exactly 1 changed file under whois/, but this PR contains ${prData.files.length} file(s).`,
        );
      } else {
        const file = prData.files[0];
        resultManager.setDetail("fileName", file.filename);

        const fileMatch = /^whois\/([^\/]+)\.json$/i.exec(file.filename);
        if (!fileMatch) {
          resultManager.addError(
            `File must be located at whois/<domain>.json, but got "${file.filename}".`,
          );
        } else {
          const baseName = fileMatch[1].toLowerCase();

          // Match the longest supported suffix from the end of the domain
          const supportedSLDs = await sldService.getSupportedSLDs();
          const sortedSLDs = [...supportedSLDs].sort((a, b) => b.length - a.length);
          let sld = null;
          let domain = null;
          for (const candidate of sortedSLDs) {
            if (baseName.endsWith("." + candidate.toLowerCase())) {
              sld = candidate;
              domain = baseName.slice(0, -(candidate.length + 1));
              break;
            }
          }

          if (!domain) {
            resultManager.addError(
              `Unsupported sTLD: the domain "${baseName}" does not use any currently supported suffix. Supported suffixes are: ${supportedSLDs.join(", ")}`,
            );
          } else if (domain.includes(".")) {
            // Multi-level name (e.g. "name.ai.no.kg"): only a single label under
            // the sTLD is a registrable domain
            resultManager.addError(
              `Unsupported domain: "${domain}.${sld}" is a multi-level domain. Only a single label under the sTLD is allowed (e.g. "name.${sld}").`,
            );
          } else {
            resultManager.setDetail("domainName", domain);
            resultManager.setDetail("sld", sld);
            resultManager.setDetail(
              "actionType",
              file.status === "added"
                ? "Registration"
                : file.status === "removed"
                  ? "Remove"
                  : "Update",
            );

            // Check 1: the sTLD must be supported (getSupportedSLDs only returns 'live' ones;
            // give a clearer message when the suffix exists in the list but is not live)
            if (!supportedSLDs.includes(sld)) {
              const status = await sldService.getSLDStatus(sld);
              resultManager.addError(
                `The sTLD "${sld}" is currently not available (status: ${status || "unknown"}). Supported suffixes are: ${supportedSLDs.join(", ")}`,
              );
            }

            // Check 2: no duplicates — neither on main nor pending in another open PR
            const baseRepository =
              process.env.BASE_REPOSITORY || config.github.repository;
            const [owner, repo] = baseRepository.split("/");
            const normalizedPath = `whois/${baseName}.json`;

            const existsOnMain = await githubService.checkFileExists(
              normalizedPath,
              "main",
              owner,
              repo,
            );
            if (file.status === "added" && existsOnMain) {
              resultManager.addError(
                `Duplicate registration: "${baseName}" already exists in the whois/ directory on the main branch.`,
              );
            }
            if (file.status !== "added" && !existsOnMain) {
              resultManager.addError(
                `Cannot ${file.status === "removed" ? "remove" : "update"} "${baseName}": the file does not exist on the main branch.`,
              );
            }

            const conflicts = await this.findConflictingPRs(
              normalizedPath,
              prData.number,
              owner,
              repo,
            );
            if (conflicts.length > 0) {
              resultManager.addError(
                `Domain conflict: the same domain is already pending in open pull request(s) ${conflicts.map((n) => "#" + n).join(", ")}.`,
              );
            }
          }
        }
      }

      const report = await reportGenerator.generateTransitionReport(
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

  /**
   * Find open PRs (excluding the current one) that touch the same whois file.
   * @param {string} filePath - Normalized whois file path (lowercase).
   * @param {number} currentPrNumber - The PR being validated.
   * @returns {Promise<number[]>} Conflicting PR numbers.
   */
  async findConflictingPRs(filePath, currentPrNumber, owner, repo) {
    const openPRs = await githubService.listOpenPullRequests(owner, repo);
    const conflicts = [];
    for (const pr of openPRs) {
      if (pr.number === currentPrNumber) continue;
      const files = await githubService.getPullRequestFiles(
        pr.number,
        owner,
        repo,
      );
      if (files.some((f) => f.filename.toLowerCase() === filePath)) {
        conflicts.push(pr.number);
      }
    }
    return conflicts;
  }

  /**
   * Full validation (used when the transition period ends).
   * @param {object} prData - The pull request data.
   * @returns {Promise<object>} The final validation result.
   */
  async validateFull(prData) {
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
