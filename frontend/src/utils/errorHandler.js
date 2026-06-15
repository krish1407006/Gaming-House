// Centralized error handling utility
class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.maxErrorsPerType = 3;
    this.resetInterval = 60000; // Reset counts every minute
    
    // Reset error counts periodically
    setInterval(() => {
      this.errorCounts.clear();
    }, this.resetInterval);
  }

  // Log error only if it hasn't been logged too many times
  logError(errorType, error, context = '') {
    const key = `${errorType}:${context}`;
    const count = this.errorCounts.get(key) || 0;
    
    if (count < this.maxErrorsPerType) {
      console.error(`[${errorType}] ${context}:`, error);
      this.errorCounts.set(key, count + 1);
      
      if (count + 1 === this.maxErrorsPerType) {
        console.warn(`[${errorType}] Too many similar errors. Suppressing further logs for this type.`);
      }
    }
  }

  // Handle API errors specifically
  handleApiError(error, endpoint, silent = false) {
    const isNetworkError = error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      // Only log network errors once per endpoint
      if (!silent) {
        this.logError('NETWORK', error, endpoint);
      }
      return { type: 'network', shouldFallback: true };
    }
    
    if (error.message?.includes('404')) {
      this.logError('NOT_FOUND', error, endpoint);
      return { type: 'not_found', shouldFallback: true };
    }
    
    // Log other errors normally but with throttling
    if (!silent) {
      this.logError('API', error, endpoint);
    }
    return { type: 'api', shouldFallback: true };
  }

  // Create a user-friendly error message
  getUserMessage(error, context = '') {
    const isNetworkError = error.message?.includes('net::ERR_BLOCKED_BY_CLIENT') || 
                          error.message?.includes('Failed to fetch');
    
    if (isNetworkError) {
      return 'Connection issue detected. Using offline data.';
    }
    
    if (error.message?.includes('404')) {
      return 'The requested content was not found.';
    }
    
    return context ? `${context}: ${error.message}` : error.message;
  }
}

// Export a singleton instance
export const errorHandler = new ErrorHandler();
export default errorHandler;