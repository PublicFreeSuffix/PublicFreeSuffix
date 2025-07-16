const fs = require('fs');
const path = require('path');
const config = require('./config');
const reservedWordsService = require('./reserved-words');
const sldService = require('./sld-service');
const logger = require('./logger');
const githubService = require('./github-service');

// Import validators
const nameserversValidator = require('./validators/nameservers');
const agreementsValidator = require('./validators/agreements');
const registrantValidator = require('./validators/registrant');

class PRValidator {
  constructor() {
    // Check required environment variables
    if (!process.env.MY_GITHUB_TOKEN) {
      throw new Error('MY_GITHUB_TOKEN environment variable is required but not set');
    }

    // PR title regex: Registration/Update/Remove: domain-name.sld
    this.titleRegex = /^(Registration|Update|Remove):\s+([a-zA-Z0-9-]+)\.(.+)$/;
    this.errors = [];
  }

  /**
   * Main validation function
   */
  async validatePullRequest() {
    console.log('🔍 Starting PR validation process');
    
    const validationResult = {
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
        fileName: null
      }
    };

    try {
      // Get PR information
      const prData = this.getPRDataFromEnv();
      console.log(`Validating PR #${prData.number}: ${prData.title}`);

      // Add error checking function
      const addError = (error) => {
        if (error) {
          validationResult.errors.push(error);
          validationResult.isValid = false;
        } else {
          console.warn('Attempted to add null/undefined error');
        }
      };

      // 1. Validate PR title format
      const titleValidation = await this.validateTitle(prData.title);
      validationResult.details.titleValid = titleValidation.isValid;
      validationResult.details.actionType = titleValidation.actionType;
      validationResult.details.domainName = titleValidation.domainName;
      validationResult.details.sld = titleValidation.sld;
      
      if (!titleValidation.isValid) {
        addError(titleValidation.error);
      }

      // 2. Validate PR description length
      const descriptionValidation = this.validatePRDescription(prData.body);
      if (!descriptionValidation.isValid) {
        addError(descriptionValidation.error);
      }

      // 3. Validate file count
      const fileCountValidation = this.validateFileCount(prData.files);
      validationResult.details.fileCountValid = fileCountValidation;
      
      if (!fileCountValidation) {
        addError('PR must contain at least one file change');
      }

      // 4. Validate file path
      if (prData.files.length > 0) {
        const filePathValidation = this.validateFilePath(prData.files[0].filename);
        validationResult.details.filePathValid = filePathValidation;
        validationResult.details.fileName = prData.files[0].filename;
        
        if (!filePathValidation) {
          addError('File path is incorrect. File must be located in the whois/ directory and be a .json file.');
        }

        // 5. Perform different validations based on operation type
        if (titleValidation.isValid && filePathValidation) {
          if (titleValidation.actionType === 'Remove') {
            // Special validation for Remove operation
            const removeValidation = await this.validateRemoveOperation(prData.files[0], titleValidation);
            validationResult.details.jsonValid = removeValidation.isValid;
            if (!removeValidation.isValid) {
              addError(removeValidation.error);
            }
          } else {
            // Regular JSON validation for other operation types (Registration/Update)
            if (['added', 'modified'].includes(prData.files[0].status)) {
              const jsonValidation = await this.validateJsonContent(prData.files[0], prData);
              validationResult.details.jsonValid = jsonValidation.isValid;
              if (!jsonValidation.isValid) {
                addError(jsonValidation.error);
              }
            }
          }

          // Validate title and filename consistency
          const consistencyValidation = this.validateTitleFileConsistency(
            titleValidation, 
            prData.files[0].filename
          );
          
          if (!consistencyValidation.isValid) {
            addError(consistencyValidation.error);
          }
        }
      }

      // Log validation results
      this.logValidationResult(validationResult, prData.number);
      
      // Generate validation report
      const report = await this.generateValidationReport(validationResult, prData.author);
      validationResult.report = report;

      // Save results to file
      this.saveValidationResult(validationResult);
      
      return validationResult;

    } catch (error) {
      console.error('Error occurred during validation:', error);
      validationResult.isValid = false;
      // Ensure error message is not empty
      const errorMessage = error && error.message ? error.message : 'An unknown error occurred during validation';
      addError(`Internal validation error: ${errorMessage}`);
      validationResult.report = `❌ PR Validation Failed\n\nInternal error occurred during validation: ${errorMessage}`;
      this.saveValidationResult(validationResult);
      return validationResult;
    }
  }

  /**
   * Get PR data from environment variables
   */
  getPRDataFromEnv() {
    const prTitle = process.env.PR_TITLE || '';
    const prBody = process.env.PR_BODY || '';
    const prNumber = process.env.PR_NUMBER || '';
    const prAuthor = process.env.PR_AUTHOR || '';
    const prFiles = JSON.parse(process.env.PR_FILES || '[]');
    const headSha = process.env.HEAD_SHA || '';

    return {
      title: prTitle,
      body: prBody,
      number: prNumber,
      author: prAuthor,
      files: prFiles,
      headSha: headSha
    };
  }

  /**
   * Validate PR title format
   */
  async validateTitle(title) {
    const result = {
      isValid: false,
      actionType: null,
      domainName: null,
      sld: null,
      error: null
    };

    if (!title || typeof title !== 'string') {
      result.error = 'PR title cannot be empty';
      return result;
    }

    const match = title.match(this.titleRegex);
    
    if (!match) {
      result.error = `PR title format is incorrect. Correct format should be: "Registration/Update/Remove: {domain-name}.{sld}". Current title: "${title}"`;
      return result;
    }

    const actionType = match[1];
    const domainName = match[2];
    const sldPart = match[3];

    // Validate if sld part is in the supported list
    const sldValidation = await this.validateDomainSuffix(sldPart);
    if (!sldValidation.isValid) {
      result.error = sldValidation.error;
      return result;
    }

    result.isValid = true;
    result.actionType = actionType;
    result.domainName = domainName;
    result.sld = sldPart;

    return result;
  }

  /**
   * Validate PR description length
   */
  validatePRDescription(body) {
    const result = {
      isValid: false,
      error: null
    };

    if (!body || typeof body !== 'string') {
      result.error = 'PR description cannot be empty';
      console.log('PR description validation failed: empty description');
      return result;
    }

    // Define key sections to check
    const requiredSections = {
      'Operation Type': {
        regex: /## Operation Type\s*-\s*\[[\sx]]\s*Registration,\s*Register a new domain name\.\s*-\s*\[[\sx]]\s*Update,\s*Update NS information or registrant email for an existing domain\.\s*-\s*\[[\sx]]\s*Remove,\s*Cancel my domain name\./m,
        error: 'Operation Type section is missing or incomplete. Please select one operation type.'
      },
      'Domain': {
        regex: /## Domain\s*-\s*\[[\sx]]/m,
        error: 'Domain section is missing or incomplete. Please confirm your domain name.'
      },
      'Confirmation Items': {
        regex: /## Confirmation Items(\s*-\s*\[[\sx]].+){9,}/m,  // Ensure at least 9 confirmation items
        error: 'Confirmation Items section is missing or incomplete. All 9 confirmation items must be present.'
      }
    };

    // Check each required section
    const missingParts = [];
    for (const [section, check] of Object.entries(requiredSections)) {
      if (!check.regex.test(body)) {
        missingParts.push(check.error);
        console.log(`PR description validation failed: ${section} section validation failed`);
      }
    }

    // Extract Operation Type section
    const operationTypeMatch = body.match(/## Operation Type([\s\S]*?)(?=##|$)/);
    if (operationTypeMatch) {
      const operationTypePart = operationTypeMatch[1];
      
      // Extract all checkboxes
      const checkboxes = operationTypePart.match(/\[[\sx]]/g) || [];
      const checkedBoxes = checkboxes.filter(box => box === '[x]').length;
      
      // Check if only one operation type is selected
      if (checkedBoxes === 0) {
        missingParts.push('Please select one operation type by checking the corresponding checkbox.');
        logger.debug('No operation type selected');
      } else if (checkedBoxes > 1) {
        missingParts.push('Please select only one operation type. Multiple operation types are selected.');
        logger.debug(`Multiple operation types selected: ${checkedBoxes}`);
      }
    } else {
      missingParts.push('Operation Type section is missing or malformed.');
      logger.debug('Operation Type section not found');
    }

    // Check if all confirmation items are checked
    const confirmationItems = body.match(/\[[\sx]]/g) || [];
    const checkedItems = confirmationItems.filter(item => item === '[x]').length;
    
    // Note: Now we need to judge based on the actual number of checked checkboxes
    // Total should be: 9 confirmation items + 1 domain confirmation + 1 operation type = 11
    if (checkedItems < 11) {
      missingParts.push(`Please check all confirmation items. Only ${checkedItems} of 11 required items are checked.`);
      logger.debug(`Insufficient checked items: ${checkedItems} of 11`);
    }

    if (missingParts.length > 0) {
      result.error = 'PR description validation failed:\n' + missingParts.join('\n');
      return result;
    }

    logger.info('PR description validation passed: all required sections and checkboxes are present');
    result.isValid = true;
    return result;
  }

  /**
   * Validate file count
   */
  validateFileCount(files) {
    const result = {
      isValid: false,
      error: null
    };

    if (!Array.isArray(files)) {
      result.error = 'Unable to get file change information';
      return result;
    }

    if (files.length === 0) {
      result.error = 'PR must contain at least one file change';
      return result;
    }

    if (files.length > config.validation.maxFileCount) {
      result.error = `PR can only contain 1 file change, currently contains ${files.length} files: ${files.map(f => f.filename).join(', ')}`;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate file path
   */
  validateFilePath(file) {
    const result = {
      isValid: false,
      error: null
    };

    if (!file || !file.filename) {
      result.error = 'Unable to get file information';
      return result;
    }

    // Check if file path is whois/*.json
    if (!config.validation.filePathPattern.test(file.filename)) {
      result.error = `File path is incorrect. File must be located in the whois/ directory and be a .json file. Current file: "${file.filename}"`;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate JSON content format
   */
  async validateJsonContent(file, prData) {
    const result = { isValid: false, error: null };
    try {
      // 1. Get file content
      const fileContent = await this.getFileContent(file, prData);
      if (!fileContent) {
        result.error = 'Unable to get file content';
        return result;
      }

      // 2. Validate JSON format
      try {
        const jsonData = JSON.parse(fileContent);
        
        // 3. Basic null check
        if (jsonData === null || jsonData === undefined) {
          result.error = 'JSON file content cannot be null or undefined';
          return result;
        }

        // 4. Validate root level must be an object
        if (typeof jsonData !== 'object' || Array.isArray(jsonData)) {
          result.error = 'JSON file root level must be an object';
          return result;
        }

        // 5. Call detailed field validation
        const fieldValidation = await this.validateJsonFields(jsonData);
        if (!fieldValidation.isValid) {
          result.error = fieldValidation.error;
          return result;
        }

        // Add cache properties for subsequent use
        result.validatedData = {
          registrant: jsonData.registrant,
          domain: jsonData.domain,
          sld: jsonData.sld,
          nameservers: jsonData.nameservers,
          agree_to_agreements: jsonData.agree_to_agreements
        };

        result.isValid = true;
        return result;
      } catch (parseError) {
        result.error = `Invalid JSON format: ${parseError.message}`;
        return result;
      }
    } catch (error) {
      result.error = `Error occurred while validating JSON content: ${error.message}`;
      return result;
    }
  }

  /**
   * Validate JSON field content
   */
  async validateJsonFields(jsonData) {
    const result = { isValid: false, error: null };

    // 1. Define required fields list
    const requiredFields = [
      'registrant',
      'domain',
      'sld',
      'nameservers',
      'agree_to_agreements'
    ];

    // 2. Check if required fields are missing
    const missingFields = requiredFields.filter(field => !(field in jsonData));
    if (missingFields.length > 0) {
      result.error = `Missing required fields: ${missingFields.join(', ')}`;
      return result;
    }

    // 3. Check if there are extra fields
    const extraFields = Object.keys(jsonData).filter(field => !requiredFields.includes(field));
    if (extraFields.length > 0) {
      result.error = `Unexpected fields found: ${extraFields.join(', ')}`;
      return result;
    }

    // 4. Validate each field value
    try {
      // 4.1 Validate registrant
      const registrantValidation = registrantValidator.validate(jsonData.registrant);
      if (!registrantValidation.isValid) {
        result.error = `Invalid registrant: ${registrantValidation.error}`;
        return result;
      }

      // 4.2 Validate domain
      const domainValidation = await this.validateDomainField(jsonData.domain);
      if (!domainValidation.isValid) {
        result.error = `Invalid domain: ${domainValidation.error}`;
        return result;
      }

      // 4.3 Validate sld
      const sldValidation = await this.validateSldField(jsonData.sld);
      if (!sldValidation.isValid) {
        result.error = `Invalid sld: ${sldValidation.error}`;
        return result;
      }

      // 4.4 Validate nameservers
      const nameserversValidation = nameserversValidator.validate(jsonData.nameservers);
      if (!nameserversValidation.isValid) {
        result.error = `Invalid nameservers: ${nameserversValidation.error}`;
        return result;
      }

      // 4.5 Validate agree_to_agreements
      const agreementsValidation = agreementsValidator.validate(jsonData.agree_to_agreements);
      if (!agreementsValidation.isValid) {
        result.error = `Invalid agree_to_agreements: ${agreementsValidation.error}`;
        return result;
      }

      result.isValid = true;
      return result;
    } catch (error) {
      result.error = `Validation error: ${error.message}`;
      return result;
    }
  }

  /**
   * Validate registrant field (email format)
   */
  /**
   * Validate domain field
   */
  async validateDomainField(domain) {
    const result = { isValid: false, error: null };

    if (!domain || typeof domain !== 'string') {
      result.error = 'domain field is required and must be a string';
      return result;
    }

    // Length validation - allow 3 characters or more
    if (domain.length < 3) {
      result.error = `domain must be at least 3 characters. Current length: ${domain.length}`;
      return result;
    }

    // Domain format validation: alphanumeric and hyphens, or xn-- format punycode
    const domainRegex = /^[a-zA-Z0-9-]+$|^xn--[a-zA-Z0-9-]+$/;
    
    if (!domainRegex.test(domain)) {
      result.error = `domain must be alphanumeric with hyphens or xn-- format punycode. Current value: "${domain}"`;
      return result;
    }

    // Validate that it cannot start or end with a hyphen
    if (domain.startsWith('-') || domain.endsWith('-')) {
      result.error = `domain cannot start or end with a hyphen. Current value: "${domain}"`;
      return result;
    }

    // Validate that domain is not in reserved words list
    const reservedWordsValidation = await this.validateDomainNotReserved(domain);
    if (!reservedWordsValidation.isValid) {
      result.error = reservedWordsValidation.error;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate that domain is not in reserved words list
   */
  async validateDomainNotReserved(domain) {
    const result = { isValid: false, error: null };

    try {
      // Get reserved words list
      const reservedWords = await reservedWordsService.getReservedWords();
      const domainLower = domain.toLowerCase();
      
      // Check for conflicts with reserved words
      for (const reservedWord of reservedWords) {
        if (domainLower === reservedWord.toLowerCase()) {
          result.error = `Domain "${domain}" conflicts with reserved word "${reservedWord}" and cannot be used. Reserved words are used to protect system functions and avoid confusion.`;
          return result;
        }
      }

      result.isValid = true;
      return result;

    } catch (error) {
      // If unable to read reserved words list, reject validation
      logger.error('Error occurred while checking reserved words:', error);
      result.error = error.message;
      return result;
    }
  }

  /**
   * Validate sld field
   */
  async validateSldField(sld) {
    const result = { isValid: false, error: null };

    if (!sld || typeof sld !== 'string') {
      result.error = 'sld field is required and must be a string';
      return result;
    }

    // Validate if sld is in the supported list
    const sldValidation = await this.validateDomainSuffix(sld);
    if (!sldValidation.isValid) {
      result.error = sldValidation.error;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Validate nameservers field
   */
  /**
   * Validate agree_to_agreements field
   */
  /**
   * Validate title and filename consistency
   */
  validateTitleFileConsistency(titleValidation, fileName) {
    const result = {
      isValid: false,
      error: null
    };

    // Extract domain from filename: whois/example.com.json -> example.com
    const fileNameRegex = /^whois\/([^\/]+)\.json$/;
    const fileMatch = fileName.match(fileNameRegex);
    
    if (!fileMatch) {
      result.error = 'Unable to extract domain information from filename';
      return result;
    }

    const fileBaseName = fileMatch[1]; // example.com
    const titleDomainFull = `${titleValidation.domainName}.${titleValidation.sld}`; // example.com

    if (fileBaseName !== titleDomainFull) {
      result.error = `Domain "${titleDomainFull}" in PR title does not match domain "${fileBaseName}" in filename`;
      return result;
    }

    result.isValid = true;
    return result;
  }

  /**
   * Get file content
   */
  async getFileContent(file, prData) {
    try {
      // For added files, extract content from patch
      if (file.status === 'added' && file.patch) {
        return this.extractContentFromPatch(file.patch);
      }

      // For modified files, get the latest version
      if (file.status === 'modified') {
        const [owner, repo] = config.github.repository.split('/');
        const content = await githubService.getFileContent(
          file.filename,
          prData.headSha,
          owner,
          repo
        );
        
        return content;
      }

      return null;
    } catch (error) {
      logger.error('Failed to get file content:', error);
      return null;
    }
  }

  /**
   * Extract file content from patch
   */
  extractContentFromPatch(patch) {
    if (!patch) return null;

    const lines = patch.split('\n');
    const content = [];
    
    for (const line of lines) {
      // Skip patch header information
      if (line.startsWith('@@') || line.startsWith('+++') || line.startsWith('---')) {
        continue;
      }
      
      // Add new lines (starting with +, but not +++)
      if (line.startsWith('+') && !line.startsWith('+++')) {
        content.push(line.substring(1)); // Remove the + sign
      }
    }
    
    return content.join('\n');
  }

  /**
   * Log validation results
   */
  logValidationResult(validationResult, prNumber) {
    if (validationResult.isValid) {
      console.log(`✅ PR #${prNumber} validation passed`);
      console.log(`   Action type: ${validationResult.details.actionType}`);
      console.log(`   Domain: ${validationResult.details.domainName}.${validationResult.details.sld}`);
      console.log(`   File: ${validationResult.details.fileName}`);
    } else {
      console.log(`❌ PR #${prNumber} validation failed`);
      console.log('Validation errors:', JSON.stringify(validationResult.errors, null, 2));
      validationResult.errors.forEach((error, index) => {
        console.log(`   Error ${index + 1}: ${error}`);
      });
    }

    if (validationResult.warnings.length > 0) {
      console.log(`⚠️  PR #${prNumber} has warnings:`);
      validationResult.warnings.forEach((warning, index) => {
        console.log(`   Warning ${index + 1}: ${warning}`);
      });
    }
  }

  /**
   * Generate validation report message (for GitHub comments)
   */
  async generateValidationReport(validationResult, mentionUser = null) {
    const report = validationResult.isValid
      ? this.generateSuccessReport(validationResult, mentionUser)
      : this.generateFailureReport(validationResult, mentionUser);

    try {
      // Only update PR labels based on validation result
      if (process.env.PR_NUMBER) {
        const [owner, repo] = config.github.repository.split('/');
        
        // Update PR labels based on validation result
        const labels = validationResult.isValid
          ? ['validation-passed']
          : ['validation-failed'];
        
        await githubService.updatePullRequestLabels(
          process.env.PR_NUMBER,
          labels,
          owner,
          repo
        );
      }
    } catch (error) {
      logger.error('Failed to update PR labels:', error);
    }

    return report;
  }

  /**
   * Generate success report
   */
  generateSuccessReport(validationResult, mentionUser) {
    return `✅ PR Validation Passed

${mentionUser ? `@${mentionUser} ` : ''}**Validation Results:**
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

⏭️ **Final Step: you just need to complete the registrant's email verification according to [RARE Instructions](https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/AUTHORIZATION.md) to complete the merger.**`;
  }

  /**
   * Generate failure report
   */
  generateFailureReport(validationResult, mentionUser) {
    let report = `❌ PR Validation Failed

${mentionUser ? `@${mentionUser} ` : ''}**The following issues were found:**
`;
      
    validationResult.errors.forEach((error, index) => {
      report += `${index + 1}. ❌ ${error}\n`;
    });

    // Generate targeted help information based on specific errors
    const helpSections = this.generateTargetedHelp(validationResult.errors);
    
    if (helpSections.length > 0) {
      report += `\n**Solutions:**\n`;
      helpSections.forEach((section, index) => {
        report += `\n### ${index + 1}. ${section.title}\n${section.content}\n`;
      });
    }

    report += `\n**Need help?** Please refer to the [README](${config.github.readmeUrl}).`;

    return report;
  }

  /**
   * Generate targeted help information based on error types
   */
  generateTargetedHelp(errors) {
    const helpSections = [];
    const errorTypes = this.categorizeErrors(errors);

    if (errorTypes.titleFormat) {
      helpSections.push({
        title: "Fix Title Format",
        content: `The title must strictly follow this format:
\`\`\`
Registration: example.no.kg
Update: example.no.kg  
Remove: example.no.kg
\`\`\`

**Supported domain suffixes:** ${config.sld ? config.sld.join(', ') : 'Please check configuration'}

**Examples:**
- ✅ \`Registration: mycompany.no.kg\`
- ❌ \`Add new domain mycompany.no.kg\`
- ❌ \`Registration mycompany.no.kg\` (missing colon)`
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

**Template link:** [PR Request Template](https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/.github/pull_request_template.md)`
      });
    }

    if (errorTypes.fileCount) {
      helpSections.push({
        title: "Adjust File Count",
        content: `Each PR can only contain 1 file change.

**Solutions:**
- If you need to handle multiple domains, create separate PRs
- Check if other files were accidentally included
- Ensure only the target JSON file was modified`
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
- Must be located in the \`whois/\` directory`
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
- You have the necessary permissions`
      });
    }

    // Add more error type help information...
    // You can continue adding help for other error types here

    return helpSections;
  }

  /**
   * Categorize error messages
   */
  categorizeErrors(errors) {
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
      removeOperation: false  // Add new error type
    };

    errors.forEach(error => {
      // Add check for undefined errors
      if (!error) {
        console.warn('Encountered undefined error in categorizeErrors');
        return;
      }
      
      const errorLower = error.toLowerCase();
      
      if (errorLower.includes('title format') || errorLower.includes('pr title')) {
        categories.titleFormat = true;
      }
      if (errorLower.includes('description') && errorLower.includes('1300')) {
        categories.descriptionLength = true;
      }
      if (errorLower.includes('file change') || errorLower.includes('file count')) {
        categories.fileCount = true;
      }
      if (errorLower.includes('file path') || errorLower.includes('whois/')) {
        categories.filePath = true;
      }
      if (errorLower.includes('json format') || (errorLower.includes('json') && errorLower.includes('invalid'))) {
        categories.jsonFormat = true;
      }
      if (errorLower.includes('registrant') || errorLower.includes('email')) {
        categories.registrant = true;
      }
      if (errorLower.includes('domain') && !errorLower.includes('reserved')) {
        categories.domain = true;
      }
      if (errorLower.includes('reserved') || errorLower.includes('conflicts')) {
        categories.reservedWords = true;
      }
      if (errorLower.includes('sld') || errorLower.includes('suffix')) {
        categories.sld = true;
      }
      if (errorLower.includes('nameservers') || errorLower.includes('dns')) {
        categories.nameservers = true;
      }
      if (errorLower.includes('agree_to_agreements') || errorLower.includes('agreement')) {
        categories.agreements = true;
      }
      if (errorLower.includes('not match') || errorLower.includes('consistency')) {
        categories.consistency = true;
      }
      // Add Remove operation related error checking
      if (errorLower.includes('remove operation') || 
          errorLower.includes('cannot remove file') ||
          (errorLower.includes('file') && errorLower.includes('removed'))) {
        categories.removeOperation = true;
      }
    });

    return categories;
  }

  /**
   * Save validation results to file
   */
  saveValidationResult(validationResult) {
    try {
      const resultPath = path.join(__dirname, 'validation-result.json');
      fs.writeFileSync(resultPath, JSON.stringify(validationResult, null, 2));
      console.log('Validation result saved to:', resultPath);
    } catch (error) {
      console.error('Failed to save validation result:', error);
    }
  }

  /**
   * Validate domain suffix is supported
   */
  async validateDomainSuffix(suffix) {
    const result = { isValid: false, error: null };

    try {
      // Get supported SLD list
      const supportedSLDs = await sldService.getSupportedSLDs();

      if (!supportedSLDs || !Array.isArray(supportedSLDs)) {
        result.error = 'Unable to validate domain suffix due to SLD list unavailable';
        return result;
      }

      // Check if suffix is supported
      if (!supportedSLDs.includes(suffix)) {
        result.error = `Domain suffix "${suffix}" is not supported. Supported suffixes are: ${supportedSLDs.join(', ')}`;
        return result;
      }

      result.isValid = true;
      return result;

    } catch (error) {
      console.error('Error occurred while validating domain suffix:', error);
      result.error = `Failed to validate domain suffix: ${error.message}`;
      return result;
    }
  }

  /**
   * Validate SLD status
   */
  async validateSLDStatus(sld) {
    try {
      const isAvailable = await sldService.isSLDAvailable(sld);
      
      if (!isAvailable) {
        this.errors.push(`SLD "${sld}" is not available. Only SLDs with status "live" are accepted`);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error occurred while validating SLD status:', error);
      this.errors.push(`Error validating SLD status: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate PR consistency
   */
  async validatePRConsistency(title, filePath) {
    const titleMatch = /^(Add|Update|Remove|Delete) ([a-z0-9-]+\.[a-z0-9-]+)$/i.exec(title);
    if (!titleMatch) return false;

    const [, action, domain] = titleMatch;
    const [sld, tld] = domain.toLowerCase().split('.');
    const expectedPath = `${sld}/${tld}.json`;

    if (filePath.toLowerCase() !== expectedPath) {
      this.errors.push('PR title does not match file path');
      return false;
    }

    // Validate SLD status for Add and Update actions
    if (action.toLowerCase() === 'add' || action.toLowerCase() === 'update') {
      const isValidStatus = await this.validateSLDStatus(sld);
      if (!isValidStatus) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate Remove Operation
   */
  async validateRemoveOperation(file, titleValidation) {
    const result = { isValid: false, error: null };
    
    try {
      // 1. Validate file status is removed
      logger.debug(`Validating remove operation for file: ${file.filename}`);
      logger.debug(`File status: ${file.status}`);
      
      if (file.status !== 'removed') {
        result.error = `For Remove operation, file status must be 'removed', but got '${file.status}'`;
        logger.error(result.error);
        return result;
      }
      
      // 2. Validate file exists in main branch
      const [owner, repo] = config.github.repository.split('/');
      logger.debug(`Checking if file exists in main branch: ${owner}/${repo}`);
      
      const fileExists = await githubService.checkFileExists(
        file.filename,
        'main',
        owner,
        repo
      );
      
      if (!fileExists) {
        result.error = `Cannot remove file '${file.filename}' as it does not exist in the repository`;
        logger.error(result.error);
        return result;
      }
      
      // 3. Validate filename matches domain in title
      const expectedFilename = `whois/${titleValidation.domainName}.${titleValidation.sld}.json`;
      logger.debug(`Comparing filenames - Expected: ${expectedFilename}, Actual: ${file.filename}`);
      
      if (file.filename !== expectedFilename) {
        result.error = `File name '${file.filename}' does not match domain in title '${titleValidation.domainName}.${titleValidation.sld}'`;
        logger.error(result.error);
        return result;
      }
      
      logger.info(`Remove operation validation passed for ${file.filename}`);
      result.isValid = true;
      return result;
      
    } catch (error) {
      result.error = `Error validating remove operation: ${error.message}`;
      logger.error(result.error);
      return result;
    }
  }

  /**
   * Get validation errors
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Clear validation errors
   */
  clearErrors() {
    this.errors = [];
  }
}

// Main execution function
async function main() {
  try {
    console.log('Starting PR validation...');
    const validator = new PRValidator();
    const result = await validator.validatePullRequest();
    
    if (result.isValid) {
      console.log('✅ All validations passed');
      process.exit(0);
    } else {
      console.log('❌ Validation failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('Validation process failed:', error);
    process.exit(1);
  }
}

// If running this script directly
if (require.main === module) {
  main();
}

module.exports = new PRValidator(); 