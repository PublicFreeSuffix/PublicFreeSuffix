const config = require("./config");
const logger = require("./logger");
const githubService = require("./github-service");

/**
 * Extract file content from patch
 */
function extractContentFromPatch(patch) {
  if (!patch) return null;
  const lines = patch.split("\n");
  const content = [];
  for (const line of lines) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      content.push(line.substring(1));
    }
  }
  return content.join("\n");
}

/**
 * Get file content
 */
async function getFileContent(file, prData) {
  try {
    if (file.status === "added" && file.patch) {
      return extractContentFromPatch(file.patch);
    }
    if (file.status === "modified") {
      const [owner, repo] = config.github.repository.split("/");
      return await githubService.getFileContent(
        file.filename,
        prData.headSha,
        owner,
        repo
      );
    }
    return null;
  } catch (error) {
    logger.error("Failed to get file content:", error);
    return null;
  }
}

/**
 * Get PR data from environment variables and GitHub API
 */
async function getPRDataFromEnv() {
  // Preferred source: the pull_request event payload (auto-triggered runs).
  let pr = null;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath) {
    const event = require(eventPath);
    pr = event.pull_request || null;
  }

  // Fallback for workflow_dispatch (manual re-validation): the event payload
  // has no pull_request, so fetch the PR via the PR_NUMBER env variable.
  if (!pr && process.env.PR_NUMBER) {
    const [owner, repo] = config.github.repository.split("/");
    logger.info(
      `No pull_request in event payload, fetching PR #${process.env.PR_NUMBER} via API (manual trigger)`,
    );
    pr = await githubService.getPullRequest(
      parseInt(process.env.PR_NUMBER, 10),
      owner,
      repo,
    );
  }

  if (!pr) {
    throw new Error("Could not find pull request data in event payload");
  }

  const [owner, repo] = config.github.repository.split("/");
  const files = await githubService.getPullRequestFiles(pr.number, owner, repo);

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    author: pr.user.login,
    branchName: pr.head.ref,
    headSha: pr.head.sha,
    files: files,
  };
}

module.exports = {
  getPRDataFromEnv,
  getFileContent,
  extractContentFromPatch,
};