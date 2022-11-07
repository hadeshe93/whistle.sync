(function() {
  const aliossStorageKey = 'whistle.sync-alioss-config';
  const $accessKeyId = document.querySelector('#alioss-access-key-id');
  const $accessKeySecret = document.querySelector('#alioss-access-key-secret');
  const $bucket = document.querySelector('#alioss-bucket');
  const $region = document.querySelector('#alioss-region');
  const $destPath = document.querySelector('#alioss-dest-path');
  const $pushBtn = document.querySelector('#alioss-push');
  const $pullBtn = document.querySelector('#alioss-pull');

  // 请求同步接口
  function request({ url, data }) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.addEventListener('readystatechange', () => {
        if (xhr.readyState !== 4) return;
        const { response: rawResponse, status, statusText } = xhr;
        let data = rawResponse;
        try {
          data = JSON.parse(rawResponse);
        } catch (err) {}
        const result = { data, status, statusText };
        if (status > 400) {
          reject(result);
          return;
        }
        resolve(result);
      });
      xhr.send(JSON.stringify(data));
    });
  }

  // 初始化
  function init() {
    const rawAliossConfig = localStorage.getItem(aliossStorageKey);
    const aliossConfig = rawAliossConfig && JSON.parse(rawAliossConfig) || undefined;
    if (aliossConfig) {
      $accessKeyId.value = aliossConfig.accessKeyId;
      $accessKeySecret.value = aliossConfig.accessKeySecret;
      $bucket.value = aliossConfig.bucket;
      $region.value = aliossConfig.region;
      $destPath.value = aliossConfig.destPath;
    }

    $pushBtn.addEventListener('click', async function(){
      const accessKeyId = $accessKeyId.value;
      const accessKeySecret = $accessKeySecret.value;
      const bucket = $bucket.value;
      const region = $region.value;
      const destPath = $destPath.value;
      const theAliossConfig = {
        accessKeyId,
        accessKeySecret,
        bucket,
        region,
        destPath,
      };
      localStorage.setItem(aliossStorageKey, JSON.stringify(theAliossConfig));
      const { data: rsp, msg } = await request({
        url: '/plugin.sync/cgi-bin/sync',
        data: {
          op: 'push',
          ...theAliossConfig,
        },
      });
      if (rsp.code === 0) {
        window.alert('PUSH 成功');
      } else {
        window.alert(`PUSH 失败，${msg}`);
      }
    }, false);
  }

  init();
})();
