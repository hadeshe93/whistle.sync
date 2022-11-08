import { request } from "../utils/request";
import { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';

interface FetchValuesListResult {
  list: {
    name: string;
    data: string;
  }[];
}

interface ExportAllValuesResult {
  [key: string]: string;
}

interface ImportAllValuesResult {
  ec: number;
  [key: string]: any;
}

export const fetchValuesList = async (hostname: string): Promise<FetchValuesListResult> => request(`http://${hostname}/cgi-bin/values/list`);

// 按 whistle 的导出能力复刻的接口
export const exportAllValues = async (hostname: string): Promise<ExportAllValuesResult> => {
  const rulesRes = await fetchValuesList(hostname);
  const { list: values } = rulesRes;
  const result: any = {};
  values.forEach((value: any) => {
    result[value.name] = value.data;
  });
  return result;
};

// 按 whistle 的导入能力复刻的接口
export const importAllValues = (hostname: string, configs: AxiosRequestConfig): Promise<ImportAllValuesResult> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    const { data } = configs;
    Object.keys(data).forEach((key) => {
      const value = JSON.stringify(data[key]);
      formData.append(key, value);
    });
    const [host, port = 80] = hostname.split(':');
    formData.submit({
      host,
      port,
      path: `/cgi-bin/values/import?clientId=${configs.params?.clientId || ''}`,
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        let buf: any[] = [];
        res.on('data', (chunks) => {
          buf = buf.concat(chunks);
        });
        res.on('end', () => {
          let result = buf.toString();
          try {
            result = JSON.parse(result);
          } catch (err) {
          } finally {
            resolve(result as any);
          }
        });
      }
    });
  });
};
