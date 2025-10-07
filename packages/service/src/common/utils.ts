import { DateRange } from '../synchronisation/types/indexing';
import { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { Logger } from '@nestjs/common';
import { Agent, fetch as undiciFetch } from 'undici';

// Exponential backoff function (attempt >= 1)
export async function backoff(
  attempt: number,
  minDelay = 100,
  maxDelay = 1000
) {
  const delay = Math.min(maxDelay, minDelay * Math.pow(2, attempt - 1)); // Start from 100 ms, max 1 second
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Retry function with exponential backoff
export async function retry<T>(fn: () => T, retries = 4, delay = 100) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < retries - 1) {
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error; // Re-throw the last error after exhausting retries
      }
    }
  }
  throw new Error('Unreachable');
}

export function createDateRange(years: string[]): DateRange {
  if (!years.length) {
    throw new Error('The array must have at least one year.');
  }

  // Sort the array to ensure chronological order
  years.sort();

  // Create the start date as January 1st of the first year
  const startYear = Number(years[0]);
  const startDate = new Date(startYear, 0, 1); // Month is zero-based (0 = January)

  // Create the end date as December 31st of the last year
  const endYear = Number(years[years.length - 1]);
  const endDate = new Date(endYear, 11, 31); // Month is zero-based (11 = December)

  // If there's only one year, the start and end dates are the same
  return years.length === 1
    ? { start: startDate, end: startDate }
    : { start: startDate, end: endDate };
}

// TODO calling this might be applying this globally (check)
export function configureAxiosRetry(axios: AxiosInstance) {
  // Configure axios-retry for the Axios instance used by HttpService
  axiosRetry(axios, {
    retries: 3, // Number of retry attempts
    retryDelay: (retryCount) => {
      return retryCount * 1000; // Delay between retries in milliseconds
    },
    shouldResetTimeout: true, // Reset timeout between retries
    retryCondition: (error) => {
      // Retry on network errors and 5xx HTTP errors
      return (
        (error.response?.status != undefined &&
          error.response?.status >= 500) ||
        error.code === 'ECONNABORTED' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ERR_BAD_RESPONSE' ||
        error.code === 'ERR_NETWORK' ||
        (error.message != undefined &&
          error.message.includes('maxContentLength'))
      );
    },
    onRetry: (retryCount, error, requestConfig) => {
      Logger.warn(
        `Retry attempt #${retryCount} for request to ${requestConfig.url} due to ${error.code}: ${error.message}`
      );
    }
  });
}

const agent = new Agent();

export async function undiciFetchWithRetry(
  url: string,
  {
    dispatcher = agent,
    ...rest
  }: { dispatcher?: Agent; headers?: Record<string, string> } = {},
  retries = 3,
  delayMs = 500
) {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await undiciFetch(url, { ...rest, dispatcher: dispatcher });
      if (!res.ok && res.status >= 500 && attempt < retries) {
        // Server 5xx – retry
        Logger.warn(
          `Retry attempt #${attempt} for request to ${url} due to HTTP ${res.status}`
        );
        await new Promise((r) => setTimeout(r, delayMs * attempt));
        continue;
      }
      return res; // success or non-retryable status
    } catch (err: unknown) {
      // Network errors (UND_ERR_SOCKET, ECONNRESET, etc.)
      lastErr = err;

      if (typeof err === 'object') {
        const e = err as { code?: string; cause?: { code?: string } };

        const code = e.code || e.cause?.code || '';
        if (
          attempt < retries &&
          ['UND_ERR_SOCKET', 'ECONNRESET', 'ETIMEDOUT'].includes(code)
        ) {
          Logger.warn(
            `Retry attempt #${attempt} for request to ${url} due to ${code}`
          );
          await new Promise((r) => setTimeout(r, delayMs * attempt));
          continue;
        }
      }

      throw err;
    }
  }
  throw lastErr;
}
