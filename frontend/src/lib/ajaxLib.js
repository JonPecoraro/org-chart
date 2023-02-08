import axios from 'axios';
import config from '../config.js';

const url = config.apiGateway.URL;

export default {
  get   : (endpoint, params = null) => axios.get(url + endpoint, params),
  post  : (endpoint, params = null) => axios.post(url + endpoint, params),
  put   : (endpoint, params = null) => axios.put(url + endpoint, params),
  delete: (endpoint, params = null) => axios.delete(url + endpoint, params)
};
