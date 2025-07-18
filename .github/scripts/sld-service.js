const fs = require('fs');
const path = require('path');
const config = require('./config');
const logger = require('./logger');

class SLDService {
  constructor() {
    this.cacheFilePath = path.join(__dirname, config.sld.cache.filename);
    this.cachedSLDList = null;
    this.lastUpdateTime = null;
    this.cacheTimeout = config.sld.cache.timeout;
    
    // Load cache on startup
    this.loadFromCache();
  }

  /**
   * Get supported SLD list
   * @returns {Promise<string[]>} Returns all available SLD list
   */
  async getSupportedSLDs() {
    try {
      const sldList = await this.getSLDList();
      if (!sldList) return [];

      // Only return SLDs with status 'live'
      return Object.entries(sldList)
        .filter(([, info]) => info.status === config.sld.status.live)
        .map(([sld]) => sld);

    } catch (error) {
      logger.error('Error occurred while getting SLD list:', error);
      return [];
    }
  }

  /**
   * Check if SLD is available
   * @param {string} sld - SLD to check
   * @returns {Promise<boolean>} Returns true if SLD exists and status is 'live'
   */
  async isSLDAvailable(sld) {
    try {
      const sldList = await this.getSLDList();
      if (!sldList) return false;

      return sldList[sld]?.status === config.sld.status.live;
    } catch (error) {
      logger.error(`Error checking SLD availability for ${sld}:`, error);
      return false;
    }
  }

  /**
   * Get SLD information
   * @param {string} sld - SLD to get information for
   * @returns {Promise<Object|null>} SLD information object or null
   */
  async getSLDInfo(sld) {
    try {
      const sldList = await this.getSLDList();
      return sldList?.[sld] || null;
    } catch (error) {
      logger.error(`Error getting SLD info for ${sld}:`, error);
      return null;
    }
  }

  /**
   * Get the status of a specific SLD.
   * @param {string} sld - The SLD to check.
   * @returns {Promise<string|null>} The status of the SLD (e.g., 'live', 'reserved') or null if not found.
   */
  async getSLDStatus(sld) {
    try {
      const sldInfo = await this.getSLDInfo(sld);
      return sldInfo?.status || null;
    } catch (error) {
      logger.error(`Error getting SLD status for ${sld}:`, error);
      return null;
    }
  }

  /**
   * Get SLD list (prioritize cache)
   * @private
   * @returns {Promise<Object|null>} SLD list object or null
   */
  async getSLDList() {
    try {
      // Check if cache is valid
      if (this.isCacheValid()) {
        logger.debug('Using cached SLD list');
        return this.cachedSLDList;
      }

      logger.info('Cache expired or not exists, reading SLD list from file');
      
      // Read file
      const sldList = await this.readSLDList();
      
      if (sldList && Object.keys(sldList).length > 0) {
        // Update cache
        this.updateCache(sldList);
        return sldList;
      }

      logger.warn('No valid SLD list found');
      return null;

    } catch (error) {
      logger.error('Error getting SLD list:', error);
      return this.cachedSLDList; // Return cached data (even if expired) when error occurs
    }
  }

  /**
   * Read SLD list from file
   * @private
   */
  async readSLDList() {
    try {
      const filePath = path.resolve(__dirname, config.sld.localPath);
      logger.debug(`Reading SLD list from file: ${filePath}`);

      const data = await fs.promises.readFile(filePath, 'utf8');
      const sldList = JSON.parse(data);
      
      // Validate data format
      if (!this.validateSLDList(sldList)) {
        throw new Error('Invalid SLD list format');
      }

      logger.info(`Successfully read ${Object.keys(sldList).length} SLDs`);
      return sldList;

    } catch (error) {
      logger.error(`Failed to read SLD list: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validate SLD list format
   * @private
   */
  validateSLDList(sldList) {
    if (!sldList || typeof sldList !== 'object') {
      return false;
    }

    // Check each SLD entry
    for (const [sld, info] of Object.entries(sldList)) {
      if (!this.validateSLDEntry(sld, info)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Validate single SLD entry
   * @private
   */
  validateSLDEntry(sld, info) {
    // Basic type check
    if (!info || typeof info !== 'object') return false;
    if (!info.status || typeof info.status !== 'string') return false;
    if (!info.operator || typeof info.operator !== 'object') return false;

    // Check operator fields
    const operator = info.operator;
    if (!operator.organization || typeof operator.organization !== 'string') return false;
    if (!operator.website || typeof operator.website !== 'string') return false;
    if (!operator.created_at || typeof operator.created_at !== 'string') return false;
    if (!operator.description || typeof operator.description !== 'string') return false;

    return true;
  }

  /**
   * Check if cache is valid
   * @private
   */
  isCacheValid() {
    if (!this.cachedSLDList || !this.lastUpdateTime) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - this.lastUpdateTime;
    return cacheAge < this.cacheTimeout;
  }

  /**
   * Update cache
   * @private
   */
  updateCache(sldList) {
    try {
      const cacheData = {
        sldList: sldList,
        timestamp: Date.now()
      };

      fs.writeFileSync(this.cacheFilePath, JSON.stringify(cacheData, null, 2));
      
      this.cachedSLDList = sldList;
      this.lastUpdateTime = cacheData.timestamp;
      
      logger.debug(`Cache updated with ${Object.keys(sldList).length} SLDs`);
    } catch (error) {
      logger.error('Failed to update cache:', error.message);
    }
  }

  /**
   * Load data from cache
   * @private
   */
  loadFromCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const cacheContent = fs.readFileSync(this.cacheFilePath, 'utf8');
        const cacheData = JSON.parse(cacheContent);

        if (cacheData.sldList && typeof cacheData.sldList === 'object') {
          this.cachedSLDList = cacheData.sldList;
          this.lastUpdateTime = cacheData.timestamp || 0;
          
          logger.debug(`Loaded ${Object.keys(this.cachedSLDList).length} SLDs from cache, cache time: ${new Date(this.lastUpdateTime).toLocaleString()}`);
        }
      }
    } catch (error) {
      logger.error('Failed to load cache:', error.message);
      this.cachedSLDList = null;
      this.lastUpdateTime = null;
    }
  }
}

// Create singleton instance
const sldService = new SLDService();

module.exports = sldService; 