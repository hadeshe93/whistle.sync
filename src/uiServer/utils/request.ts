import Axios from 'axios';

const request = Axios.create({
  timeout: 10 * 1000,
});

request.interceptors.response.use(async (response) => {
  if (response.status > 400) throw response;
  return response.data
}, async (error) => {
  console.error('请求异常：', error);
  throw error;
});

export {
  request
};
