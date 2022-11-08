import AliOss from 'ali-oss';
import { CODE_SUCCESS, CODE_ERR_UNKNOWN } from '../constants/code';

interface PushParams extends AliOss.Options {
  payloadPairs: {
    local: string | Buffer;
    dest: string;
  }[];
  mime?: string;
}
interface PullParams extends AliOss.Options {
  payloadPairs: {
    local: string | WritableStream | null;
    dest: string;
  }[];
}

// 推送到 oss
export async function pushToAliOss(options: PushParams) {
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

// 从 oss 拉取
export async function pullFromAliOss(options: PullParams) {
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
    const responseList = await Promise.all(payloadPairs.map((payloadPair) => {
      const { local, dest } = payloadPair;
      const args: any[] = [dest];
      local && args.push(local);
      return client.get.apply(client, args);
    }));
    data = responseList.map((response) => {
      const { res } = response;
      return res.data.toString('utf-8');
    });
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

