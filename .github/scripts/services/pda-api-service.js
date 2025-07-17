const axios = require('axios');
const logger = require('../logger');

class PDAApiService {
  constructor() {
    this.baseURL = process.env.PDA_API_URL;
    this.apiKey = process.env.PDA_API_KEY;
    
    if (!this.baseURL) {
      throw new Error('PDA_API_URL environment variable is required');
    }
    
    if (!this.apiKey) {
      throw new Error('PDA_API_KEY environment variable is required');
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Get DNS records for specified zone
   * According to PDA API documentation, get records through zone information
   */
  async getZoneRecords(zoneId) {
    try {
      logger.info(`Fetching DNS records for zone: ${zoneId}`);
      const response = await this.client.get(`/api/v1/servers/localhost/zones/${zoneId}`);
      const zoneData = response.data;
      const records = zoneData.rrsets || [];
      logger.info(`Successfully fetched ${records.length} records for zone: ${zoneId}`);
      return records;
    } catch (error) {
      logger.error(`Failed to fetch DNS records for zone ${zoneId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch DNS records for zone ${zoneId}: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get DNS records for specific domain in a zone
   */
  async getDomainRecords(zoneId, domain) {
    try {
      logger.info(`Fetching DNS records for domain: ${domain}.${zoneId}`);
      
      // Get all records for the zone
      const allRecords = await this.getZoneRecords(zoneId);
      
      // Filter records for the specified domain
      const domainRecords = allRecords.filter(record => {
        const recordName = record.name.replace(/\.$/, ''); // Remove trailing dot
        const targetDomain = `${domain}.${zoneId}`;
        return recordName === targetDomain;
      });
      
      logger.info(`Found ${domainRecords.length} records for domain: ${domain}.${zoneId}`);
      return domainRecords;
      
    } catch (error) {
      logger.error(`Failed to fetch DNS records for domain ${domain}.${zoneId}:`, error.message);
      throw new Error(`Failed to fetch DNS records for domain ${domain}.${zoneId}: ${error.message}`);
    }
  }

  /**
   * Create or update NS records (overwrite operation)
   * Fixed RRSet format according to PDA API documentation
   * name field must end with dot, content field must also end with dot
   */
  async createNSRecord(zoneId, domain, nameservers) {
    try {
      logger.info(`Creating/updating NS records for ${domain}.${zoneId} with nameservers: ${nameservers.join(', ')}`);
      
      const record = {
        rrsets: [{
          name: `${domain}.${zoneId}.`, // According to documentation, name must end with dot
          type: 'NS',
          ttl: 7200,
          changetype: 'REPLACE', // According to API documentation, changetype is required
          records: nameservers.map(ns => ({
            content: `${ns}.`, // NS record content must end with dot
            disabled: false
          }))
        }]
      };

      await this.client.patch(`/api/v1/servers/localhost/zones/${zoneId}`, record);
      logger.info(`Successfully created/updated NS records for ${domain}.${zoneId}`);
    } catch (error) {
      logger.error(`Failed to create/update NS records for ${domain}.${zoneId}:`, error.response?.data || error.message);
      throw new Error(`Failed to create/update NS records for ${domain}.${zoneId}: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete NS records
   * Fixed delete format according to PDA API documentation
   */
  async deleteNSRecord(zoneId, domain) {
    try {
      logger.info(`Deleting NS records for ${domain}.${zoneId}`);
      
      const record = {
        rrsets: [{
          name: `${domain}.${zoneId}.`, // According to documentation, name must end with dot
          type: 'NS',
          changetype: 'DELETE' // According to API documentation, changetype is required for deletion
        }]
      };

      await this.client.patch(`/api/v1/servers/localhost/zones/${zoneId}`, record);
      logger.info(`Successfully deleted NS records for ${domain}.${zoneId}`);
    } catch (error) {
      logger.error(`Failed to delete NS records for ${domain}.${zoneId}:`, error.response?.data || error.message);
      throw new Error(`Failed to delete NS records for ${domain}.${zoneId}: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Check if zone exists
   */
  async checkZoneExists(zoneId) {
    try {
      await this.client.get(`/api/v1/servers/localhost/zones/${zoneId}`);
      return true;
    } catch (error) {
      if (error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get zone information
   */
  async getZoneInfo(zoneId) {
    try {
      logger.info(`Fetching zone information for: ${zoneId}`);
      const response = await this.client.get(`/api/v1/servers/localhost/zones/${zoneId}`);
      logger.info(`Successfully fetched zone information for: ${zoneId}`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fetch zone information for ${zoneId}:`, error.response?.data || error.message);
      throw new Error(`Failed to fetch zone information for ${zoneId}: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List all zones
   */
  async listZones() {
    try {
      logger.info('Fetching all zones');
      const response = await this.client.get('/api/v1/servers/localhost/zones');
      logger.info(`Successfully fetched ${response.data.length} zones`);
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch zones:', error.response?.data || error.message);
      throw new Error(`Failed to fetch zones: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      logger.info('Testing PDA API connection');
      const response = await this.client.get('/api/v1/servers/localhost');
      logger.info('PDA API connection test successful');
      return {
        success: true,
        serverInfo: response.data
      };
    } catch (error) {
      logger.error('PDA API connection test failed:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = PDAApiService; 