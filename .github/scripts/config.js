/**
 * Configuration module
 */

module.exports = {
  pda: {
    // API base URL, e.g.: https://pdd.example.com
    apiUrl: process.env.PDA_API_URL || 'https://pdd.example.com',
    
    // API key, needs to be generated in PowerDNS Admin
    apiKey: process.env.PDA_API_KEY || 'your-api-key-here',
    
    // API timeout (milliseconds)
    timeout: 30000,
    
    // Default TTL value
    defaultTtl: 300
  },
  dns: {
    // Supported record types
    supportedTypes: ['NS'],
    
    // Default record type
    defaultType: 'NS',
    
    // Record name suffix (usually a dot)
    nameSuffix: '.'
  },
  github: {
    repository: process.env.GITHUB_REPOSITORY || 'PublicFreeSuffix/PublicFreeSuffix',
    readmeUrl: 'https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/README.md',
    templateUrl: 'https://github.com/PublicFreeSuffix/PublicFreeSuffix/blob/main/.github/pull_request_template.md',
    labels: {
      validationPassed: 'validation-passed',
      validationFailed: 'validation-failed'
    }
  },
  validation: {
    maxFileCount: 1,
    filePathPattern: /^whois\/[^\/]+\.json$/,
    minDescriptionLength: 1300,
    titlePattern: /^(Registration|Update|Remove):\s+([a-zA-Z0-9-]+)\.(.+)$/
  },
  sld: {
    // Local path to SLD list file
    localPath: '../../public_sld_list.json',
    
    // Cache configuration
    cache: {
      timeout: 24 * 60 * 60 * 1000, // 24 hours
      filename: 'sld_cache.json'     // Cache filename
    },

    // SLD status definitions
    status: {
      live: 'live'  // Available status value
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    colors: {
      error: 'red',
      warn: 'yellow',
      info: 'green',
      debug: 'blue'
    }
  }
}; 