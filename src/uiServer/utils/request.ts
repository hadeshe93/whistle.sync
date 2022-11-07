import Axios from 'axios';

const request = Axios.create({
  timeout: 10 * 1000,
});

request.interceptors.response.use(async (response) => {
  if (response.status > 400) throw response;
  return response.data
}, async (error) => {
  throw error;
});

export {
  request
};
