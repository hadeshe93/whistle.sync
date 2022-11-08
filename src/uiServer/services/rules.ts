import FormData from 'form-data';
import { AxiosRequestConfig } from 'axios';

import { request } from "../utils/request";
import { fetchInit } from './base';

interface CallWhistleCgiOptions {
  hostname: string;
  clientId?: string;
}

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

interface ImportAllRulesResult {
  ec: number;
  [key: string]: any;
}

export const fetchRulesList = async (options: CallWhistleCgiOptions): Promise<FetchRulesListResult> => request(`http://${options.hostname}/cgi-bin/rules/list`);
export const removeRule = async (options: CallWhistleCgiOptions, config: AxiosRequestConfig): Promise<any> => request({
  url: `http://${options.hostname}/cgi-bin/rules/remove`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  },
  ...config,
});

// 清空所有 rules
export const clearAllRules = async (options: CallWhistleCgiOptions): Promise<any> => {
  const { clientId } = options;
  const rulesRes = await fetchRulesList(options);
  const { list: rules } = rulesRes;
  return await Promise.all(rules.map(rule => {
    const data = {
      clientId,
      name: rule.name,
      // wholeGroup: 1,
    };
    return removeRule(options, {
      data,
    })
  }))
};

// 按 whistle 的导出能力复刻的接口
export const exportAllRules = async (options: CallWhistleCgiOptions): Promise<ExportAllRulesResult> => {
  const rulesRes = await fetchRulesList(options);
  const { list: rules, defaultRules } = rulesRes;
  const result: any = {};
  rules.forEach((rule: any) => {
    result[rule.name] = rule.data;
  });
  result['Default'] = defaultRules;
  return result;
};

// 按 whistle 的导入能力复刻的接口
export const importAllRules = async (options: CallWhistleCgiOptions, configs: AxiosRequestConfig): Promise<ImportAllRulesResult> => {
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
      path: `/cgi-bin/rules/import?clientId=${clientId || ''}`,
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
