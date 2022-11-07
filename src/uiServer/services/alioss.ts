import AliOss from 'ali-oss';
import { CODE_SUCCESS, CODE_ERR_UNKNOWN } from '../constants/code';

interface PushParams extends AliOss.Options {
  payloadPairs: {
    local: string | Buffer;
    dest: string;
  }[];
  mime?: string;
}

export async function pushRulesToAliOss(options: PushParams) {
  const { accessKeyId, accessKeySecret, bucket, region, payloadPairs } = options;
  // 实例化客户端
  const client = new AliOss({
    accessKeyId,
    accessKeySecret,
    bucket,
    region,
  });
  let code = CODE_SUCCESS;
  let msg = '';
  let data;
  try {
    await Promise.all(payloadPairs.map((payloadPair) => {
      const { local, dest } = payloadPair;
      return client.put(dest, local);
    }));
  } catch (err) {
    code = CODE_ERR_UNKNOWN;
    msg = err.message;
  }
  return {
    code,
    msg,
    data,
  };
}

