const SENSITIVE_PATTERNS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'apiKey',
  'secret',
  'credential',
  'email',
  'ssn',
  'socialSecurity',
  'creditCard',
];

// Define __DEV__ if not already defined (for non-React Native environments)
const __DEV__ = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const isSensitiveKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const lowerKey = key.toLowerCase();
  return SENSITIVE_PATTERNS.some(pattern => lowerKey.includes(pattern));
};

const redactSensitiveData = (value, visited = new WeakSet()) => {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle primitives
  if (typeof value !== 'object') {
    return value;
  }

  // Handle circular references
  if (visited.has(value)) {
    return '[Circular]';
  }

  // Handle Date objects
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle RegExp objects
  if (value instanceof RegExp) {
    return value.toString();
  }

  // Mark object as visited
  visited.add(value);

  // Handle Arrays
  if (Array.isArray(value)) {
    return value.map(item => redactSensitiveData(item, visited));
  }

  // Handle Objects
  const redacted = {};
  for (const [key, val] of Object.entries(value)) {
    if (isSensitiveKey(key)) {
      redacted[key] = '[REDACTED]';
    } else {
      redacted[key] = redactSensitiveData(val, visited);
    }
  }

  return redacted;
};

const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return String(obj);
  }
};

const formatArgs = (args) => {
  return args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // Return a simplified representation for complex objects
      try {
        return JSON.parse(JSON.stringify(arg));
      } catch (e) {
        // If JSON serialization fails (circular refs, etc.), return string representation
        return String(arg);
      }
    }
    return arg;
  });
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString();
};

class Logger {
  constructor(defaultMetadata = {}) {
    this.defaultMetadata = defaultMetadata;
  }

  shouldLog(level) {
    // In development, all logs are enabled
    if (__DEV__) {
      return true;
    }

    // In production, only warn and error are enabled
    return level === 'warn' || level === 'error';
  }

  formatMessage(level, args, metadata) {
    const timestamp = getTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    // Merge default metadata with provided metadata
    const allMetadata = { ...this.defaultMetadata, ...metadata };
    
    // Add metadata if provided
    const metadataStr = Object.keys(allMetadata).length > 0 
      ? ` ${safeStringify(allMetadata)}` 
      : '';

    // Format arguments
    const formattedArgs = formatArgs(args);

    return [`${prefix}${metadataStr}`, ...formattedArgs];
  }

  _log(level, args, metadata = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    // Redact sensitive data
    const redactedArgs = args.map(arg =>
      typeof arg === 'object' && arg !== null
        ? redactSensitiveData(arg)
        : arg
    );

    // Format message
    const formattedMessage = this.formatMessage(level, redactedArgs, metadata);

    // Output to console
    switch (level) {
      case 'debug':
        console.debug(...formattedMessage);
        break;
      case 'log':
        console.log(...formattedMessage);
        break;
      case 'warn':
        console.warn(...formattedMessage);
        break;
      case 'error':
        console.error(...formattedMessage);
        break;
    }

    // Send to Reactotron if available
    if (__DEV__) {
      try {
        if (typeof Reactotron !== 'undefined' && Reactotron?.log) {
          Reactotron.log(level, redactedArgs, metadata);
        }
      } catch (e) {
        // Ignore Reactotron errors
      }
    }
  }

  debug(...args) {
    const { metadata, args: cleanArgs } = this.extractMetadata(args);
    this._log('debug', cleanArgs, metadata);
  }

  log(...args) {
    const { metadata, args: cleanArgs } = this.extractMetadata(args);
    this._log('log', cleanArgs, metadata);
  }

  warn(...args) {
    const { metadata, args: cleanArgs } = this.extractMetadata(args);
    this._log('warn', cleanArgs, metadata);
  }

  error(...args) {
    const { metadata, args: cleanArgs } = this.extractMetadata(args);
    this._log('error', cleanArgs, metadata);
  }

  extractMetadata(args) {
    if (args.length === 0) {
      return { metadata: {}, args: [] };
    }

    const lastArg = args[args.length - 1];

    // Check if last argument is a metadata object
    if (
      lastArg &&
      typeof lastArg === 'object' &&
      !Array.isArray(lastArg) &&
      lastArg._metadata
    ) {
      // Don't mutate the original object - create a copy
      const metadata = { ...lastArg._metadata };
      return {
        metadata,
        args: args.slice(0, -1),
      };
    }

    return { metadata: {}, args };
  }

  child(childMetadata = {}) {
    // Create a new logger instance with merged metadata
    const mergedMetadata = { ...this.defaultMetadata, ...childMetadata };
    return new Logger(mergedMetadata);
  }
}

// Export singleton instance
const logger = new Logger();

export default logger;

export { Logger };