const { Octokit } = require('@octokit/rest');
const logger = require('./logger');

class GitHubService {
  constructor() {
    if (!process.env.MY_GITHUB_TOKEN) {
      throw new Error('MY_GITHUB_TOKEN environment variable is required');
    }
    
    this.octokit = new Octokit({
      auth: process.env.MY_GITHUB_TOKEN
    });
  }

  /**
   * Check if file exists in specified branch
   */
  async checkFileExists(filePath, branch, owner, repo) {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch
      });
      return true;
    } catch (error) {
      if (error.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get file content
   */
  async getFileContent(filePath, ref, owner, repo) {
    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref
      });

      // If it's a file
      if (!Array.isArray(response.data)) {
        // GitHub API returns base64 encoded content
        const content = Buffer.from(response.data.content, 'base64').toString();
        return content;
      }

      throw new Error('Path points to a directory, not a file');
    } catch (error) {
      logger.error(`Failed to get file content for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Update PR labels
   */
  async updatePullRequestLabels(prNumber, labels, owner, repo) {
    try {
      await this.octokit.issues.setLabels({
        owner,
        repo,
        issue_number: prNumber,
        labels
      });
    } catch (error) {
      logger.error(`Failed to update PR labels for PR #${prNumber}:`, error);
      throw error;
    }
  }

  /**
   * List all open pull requests (paginated)
   */
  async listOpenPullRequests(owner, repo) {
    try {
      const prs = [];
      let page = 1;
      for (;;) {
        const { data } = await this.octokit.pulls.list({
          owner,
          repo,
          state: 'open',
          per_page: 100,
          page
        });
        prs.push(...data);
        if (data.length < 100) break;
        page++;
      }
      return prs;
    } catch (error) {
      logger.error(`Failed to list open pull requests for ${owner}/${repo}:`, error);
      throw error;
    }
  }

  /**
   * Get PR information
   */
  async getPullRequest(prNumber, owner, repo) {
    try {
      const { data: pullRequest } = await this.octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      });
      return pullRequest;
    } catch (error) {
      logger.error(`Failed to get PR info for PR #${prNumber}:`, error);
      throw error;
    }
  }

  /**
   * Get PR file list
   */
  async getPullRequestFiles(prNumber, owner, repo) {
    try {
      const { data: files } = await this.octokit.pulls.listFiles({
        owner,
        repo,
        pull_number: prNumber
      });
      return files;
    } catch (error) {
      logger.error(`Failed to get PR files for PR #${prNumber}:`, error);
      throw error;
    }
  }

  /**
   * Create commit status
   */
  async createCommitStatus(sha, state, description, context, owner, repo) {
    try {
      await this.octokit.repos.createCommitStatus({
        owner,
        repo,
        sha,
        state,
        description: description.substring(0, 140), // GitHub API limits description to 140 characters
        context
      });
    } catch (error) {
      logger.error(`Failed to create commit status for SHA ${sha}:`, error);
      throw error;
    }
  }
}

module.exports = new GitHubService(); 