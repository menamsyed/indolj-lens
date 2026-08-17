import axios from 'axios';
import Reactotron from '../../ReactotronConfig';
import { BASE_URL } from './config/routes';

let currentAuthToken: string | null = null;
let currentMerchantHost: string | null = null;

export const setClientAuthToken = (token: string | null): void => {
  currentAuthToken = token;
};

export const setClientMerchantHost = (host: string | null): void => {
  currentMerchantHost = host;
};

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

client.interceptors.request.use(
  (config) => {
    config.baseURL = currentMerchantHost || BASE_URL;
    if (currentAuthToken && config.headers) {
      config.headers.Authorization = `Bearer ${currentAuthToken}`;
    }
    if (__DEV__ && Reactotron && typeof Reactotron.display === 'function') {
      Reactotron.display({
        name: 'API REQUEST',
        preview: `${config.method?.toUpperCase()} ${config.url}`,
        value: {
          url: `${config.baseURL || ''}${config.url}`,
          headers: config.headers,
          data: config.data,
        },
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (response) => {
    if (__DEV__ && Reactotron && typeof Reactotron.display === 'function') {
      Reactotron.display({
        name: 'API RESPONSE',
        preview: `${response.status} ${response.config.url}`,
        value: {
          status: response.status,
          url: response.config.url,
          data: response.data,
        },
      });
    }
    return response;
  },
  (error) => {
    if (__DEV__ && Reactotron && typeof Reactotron.display === 'function') {
      Reactotron.display({
        name: 'API ERROR',
        preview: `${error.response?.status || 'FAIL'} ${error.config?.url}`,
        value: {
          status: error.response?.status,
          message: error.message,
          responseData: error.response?.data,
        },
        important: true,
      });
    }
    return Promise.reject(error);
  }
);

export default client;
