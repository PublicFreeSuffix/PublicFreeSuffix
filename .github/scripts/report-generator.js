const config = require("./config");
const logger = require("./logger");
const githubService = require("./github-service");

/**
 * Generate success report
 */
function generateSuccessReport(validationResult, mentionUser) {
  return `✅ PR Validation Passed

${mentionUser ? `@${mentionUser} ` : ""}**Validation Results:**
- ✅ Title format is correct
- ✅ PR description length meets requirements
- ✅ File count meets requirements (1 file)
- ✅ File path is correct (whois/*.json)
- ✅ JSON format is valid
- ✅ Title and filename are consistent

**Details:**
- **Action type:** ${validationResult.details.actionType}
- **Domain:** ${validationResult.details.domainName}.${validationResult.details.sld}
- **File:** ${validationResult.details.fileName}

⏭️ **Final Step: you just need to complete the registrant's email verification according to [ARAE Instructions](https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/AUTHORIZATION.md) to complete the merger.**`;
}

/**
 * Categorize error messages
 */
function categorizeErrors(errors) {
  const categories = {
    titleFormat: false,
    descriptionLength: false,
    fileCount: false,
    filePath: false,
    jsonFormat: false,
    registrant: false,
    domain: false,
    reservedWords: false,
    sld: false,
    nameservers: false,
    agreements: false,
    consistency: false,
    removeOperation: false,
  };

  errors.forEach((error) => {
    if (!error) {
      console.warn("Encountered undefined error in categorizeErrors");
      return;
    }

    const errorLower = error.toLowerCase();

    if (errorLower.includes("title format") || errorLower.includes("pr title"))
      categories.titleFormat = true;
    if (errorLower.includes("description") && errorLower.includes("1300"))
      categories.descriptionLength = true;
    if (errorLower.includes("file change") || errorLower.includes("file count"))
      categories.fileCount = true;
    if (errorLower.includes("file path") || errorLower.includes("whois/"))
      categories.filePath = true;
    if (
      errorLower.includes("json format") ||
      (errorLower.includes("json") && errorLower.includes("invalid"))
    )
      categories.jsonFormat = true;
    if (errorLower.includes("registrant") || errorLower.includes("email"))
      categories.registrant = true;
    if (errorLower.includes("domain") && !errorLower.includes("reserved"))
      categories.domain = true;
    if (errorLower.includes("reserved") || errorLower.includes("conflicts"))
      categories.reservedWords = true;
    if (errorLower.includes("sld") || errorLower.includes("suffix"))
      categories.sld = true;
    if (errorLower.includes("nameservers") || errorLower.includes("dns"))
      categories.nameservers = true;
    if (
      errorLower.includes("agree_to_agreements") ||
      errorLower.includes("agreement")
    )
      categories.agreements = true;
    if (errorLower.includes("not match") || errorLower.includes("consistency"))
      categories.consistency = true;
    if (
      errorLower.includes("remove operation") ||
      errorLower.includes("cannot remove file") ||
      (errorLower.includes("file") && errorLower.includes("removed"))
    )
      categories.removeOperation = true;
  });

  return categories;
}

/**
 * Generate targeted help information based on error types
 */
function generateTargetedHelp(errors) {
  const helpSections = [];
  const errorTypes = categorizeErrors(errors);

  if (errorTypes.titleFormat) {
    helpSections.push({
      title: "Fix Title Format",
      content: `The title must strictly follow this format:
\`\`\`
Registration: example.no.kg
Update: example.no.kg  
Remove: example.no.kg
\`\`\`

**Supported domain suffixes:** ${Array.isArray(config.sld) ? config.sld.join(", ") : "Please check configuration"}

**Examples:**
- ✅ \`Registration: mycompany.no.kg\`
- ❌ \`Add new domain mycompany.no.kg\`
- ❌ \`Registration mycompany.no.kg\` (missing colon)`,
    });
  }

  if (errorTypes.descriptionLength) {
    helpSections.push({
      title: "Complete PR Description",
      content: `The PR description must be filled out completely according to the template, requiring at least 1300 characters.

**Solutions:**
1. Use the provided PR template
2. Complete all confirmation items (including all checkboxes)
3. Provide detailed operation instructions and contact information
4. Confirm all agreement terms

**Template link:** [PR Request Template](https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/.github/pull_request_template.md)`,
    });
  }

  if (errorTypes.fileCount) {
    helpSections.push({
      title: "Adjust File Count",
      content: `Each PR can only contain 1 file change.

**Solutions:**
- If you need to handle multiple domains, create separate PRs
- Check if other files were accidentally included
- Ensure only the target JSON file was modified`,
    });
  }

  if (errorTypes.filePath) {
    helpSections.push({
      title: "Fix File Path",
      content: `Files must be located in the \`whois/\` directory and be \`.json\` files.

**Correct file path format:**
\`\`\`
whois/example.no.kg.json
whois/mycompany.so.kg.json
\`\`\`

**File naming rules:**
- Filename must exactly match the domain name
- Must have \`.json\` extension
- Must be located in the \`whois/\` directory`,
    });
  }

  if (errorTypes.removeOperation) {
    helpSections.push({
      title: "Fix Remove Operation Issues",
      content: `For Remove operations:
1. The file must exist in the repository
2. The file must be marked for deletion
3. The file name must match the domain in the PR title
4. You must have proper permissions to remove the domain

Please ensure:
- You are removing the correct file
- The file exists in the main branch
- You have the necessary permissions`,
    });
  }

  return helpSections;
}

/**
 * Generate failure report
 */
function generateFailureReport(validationResult, mentionUser) {
  let report = `❌ PR Validation Failed

${mentionUser ? `@${mentionUser} ` : ""}**The following issues were found:**
`;

  validationResult.errors.forEach((error, index) => {
    report += `${index + 1}. ❌ ${error}
`;
  });

  const helpSections = generateTargetedHelp(validationResult.errors);

  if (helpSections.length > 0) {
    report += `
**Solutions:**
`;
    helpSections.forEach((section, index) => {
      report += `
### ${index + 1}. ${section.title}
${section.content}
`;
    });
  }

  report += `
**Need help?** Please refer to the [README](${config.github.readmeUrl}).`;

  return report;
}

/**
 * Generate validation report message (for GitHub comments)
 */
async function generateValidationReport(validationResult, mentionUser = null) {
  const report = validationResult.isValid
    ? generateSuccessReport(validationResult, mentionUser)
    : generateFailureReport(validationResult, mentionUser);

  try {
    if (process.env.PR_NUMBER) {
      const [owner, repo] = config.github.repository.split("/");
      const labels = validationResult.isValid
        ? ["validation-passed"]
        : ["validation-failed"];
      await githubService.updatePullRequestLabels(
        process.env.PR_NUMBER,
        labels,
        owner,
        repo,
      );
    }
  } catch (error) {
    logger.error("Failed to update PR labels:", error);
  }

  return report;
}

module.exports = { generateValidationReport };
