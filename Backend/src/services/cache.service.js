import NodeCache from 'node-cache';

// Initialize cache with a standard TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

export const getFromCache = (key) => {
    return cache.get(key);
};

export const setToCache = (key, data) => {
    cache.set(key, data);
};

export const clearCache = () => {
    cache.flushAll();
};
