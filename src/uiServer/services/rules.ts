import { request } from "../utils/request";
import { AxiosRequestConfig } from 'axios';
import FormData from 'form-data';

interface FetchRulesListResult {
  defaultRules: string;
  list: {
    name: string;
    data: string;
  }[];
}

interface ExportAllRulesResult {
  [key: string]: string;
}

export const fetchRulesList = async (hostname: string): Promise<FetchRulesListResult> => request(`http://${hostname}/cgi-bin/rules/list`);

// 按 whistle 的导出能力复刻的接口
export const exportAllRules = async (hostname: string): Promise<ExportAllRulesResult> => {
  const rulesRes = await fetchRulesList(hostname);
  const { list: rules, defaultRules } = rulesRes;
  const result: any = {};
  rules.forEach((rule: any) => {
    result[rule.name] = rule.data;
  });
  result['Default'] = defaultRules;
  return result;
};

// 按 whistle 的导入能力复刻的接口
export const importAllRules = (hostname: string, configs: AxiosRequestConfig) => {
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
      path: `/cgi-bin/rules/import?clientId=${configs.params?.clientId || ''}`,
    }, function(err, res) {
      if (err) {
        reject(err);
      } else {
        let buf: any[] = [];
        res.on('data', (chunks) => {
          buf = buf.concat(chunks);
        });
        res.on('end', () => {
          resolve(buf.toString());
        });
      }
    });
  });
};
