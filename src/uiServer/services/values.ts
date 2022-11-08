import FormData from 'form-data';
import { AxiosRequestConfig } from 'axios';
import { request } from "../utils/request";

interface CallWhistleCgiOptions {
  hostname: string;
  clientId?: string;
}

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

export const fetchValuesList = async (options: CallWhistleCgiOptions): Promise<FetchValuesListResult> => request(`http://${options.hostname}/cgi-bin/values/list`);
export const removeValue = async (options: CallWhistleCgiOptions, config: AxiosRequestConfig): Promise<any> => request({
  url: `http://${options.hostname}/cgi-bin/values/remove`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  ...config,
});

// 清空所有 rules
export const clearAllValues = async (options: CallWhistleCgiOptions): Promise<any> => {
  const { clientId } = options;
  const valueRes = await fetchValuesList(options);
  const { list: values } = valueRes;
  return await Promise.all(values.map(value => {
    const data = {
      clientId,
      name: value.name,
    };
    return removeValue(options, {
      data,
    })
  }))
};

// 按 whistle 的导出能力复刻的接口
export const exportAllValues = async (options: CallWhistleCgiOptions): Promise<ExportAllValuesResult> => {
  const rulesRes = await fetchValuesList(options);
  const { list: values } = rulesRes;
  const result: any = {};
  values.forEach((value: any) => {
    result[value.name] = value.data;
  });
  return result;
};

// 按 whistle 的导入能力复刻的接口
export const importAllValues = async (options: CallWhistleCgiOptions, configs: AxiosRequestConfig): Promise<ImportAllValuesResult> => {
  const { hostname, clientId } = options;
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
      path: `/cgi-bin/values/import?clientId=${clientId || ''}`,
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
