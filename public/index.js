(function() {
  const aliossStorageKey = 'whistle.sync-alioss-config';
  const $accessKeyId = document.querySelector('#alioss-access-key-id');
  const $accessKeySecret = document.querySelector('#alioss-access-key-secret');
  const $bucket = document.querySelector('#alioss-bucket');
  const $region = document.querySelector('#alioss-region');
  const $destPath = document.querySelector('#alioss-dest-path');

  const $cancelBtn = document.querySelector('#alioss-cancel');
  const $editBtn = document.querySelector('#alioss-edit');
  const $saveBtn = document.querySelector('#alioss-save');
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

  // toggle 按钮
  function toggleDisplay(elem, show) {
    elem.style.display = Boolean(show) ? 'block' : 'none';
  }

  // toggle 表单
  function toggleFormEnable(enabled) {
    const isEnabled = Boolean(enabled);
    const attrOperation = isEnabled ? 'removeAttribute' : 'setAttribute';

    $accessKeyId[attrOperation]('disabled', isEnabled || '');
    $accessKeySecret[attrOperation]('disabled', isEnabled || '');
    $bucket[attrOperation]('disabled', isEnabled || '');
    $region[attrOperation]('disabled', isEnabled || '');
    $destPath[attrOperation]('disabled', isEnabled || '');

    toggleDisplay($saveBtn, enabled);
    toggleDisplay($cancelBtn, enabled);
    toggleDisplay($editBtn, !enabled);
    toggleDisplay($pushBtn, !enabled);
    toggleDisplay($pullBtn, !enabled);
  }

  // 获取当前配置
  function getConfigs() {
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
    return theAliossConfig;
  }

  // 保存配置
  function saveConfigs() {
    localStorage.setItem(aliossStorageKey, JSON.stringify(getConfigs()));
  }

  let configs = {};
  // 暂存配置
  function stashConfigs() {
    configs = JSON.parse(JSON.stringify(getConfigs()));
  }
  // 恢复配置
  function restoreConfigs(aliossConfig) {
    aliossConfig = JSON.parse(JSON.stringify(aliossConfig || configs));
    $accessKeyId.value = aliossConfig.accessKeyId;
    $accessKeySecret.value = aliossConfig.accessKeySecret;
    $bucket.value = aliossConfig.bucket;
    $region.value = aliossConfig.region;
    $destPath.value = aliossConfig.destPath;
  }


  // 初始化
  function init() {
    const rawAliossConfig = localStorage.getItem(aliossStorageKey);
    const aliossConfig = rawAliossConfig && JSON.parse(rawAliossConfig) || undefined;
    if (aliossConfig) {
      restoreConfigs(aliossConfig);
    }

    // 推送按钮
    $pushBtn.addEventListener('click', async function(){
      const theAliossConfig = getConfigs();
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

    // 编辑按钮
    $editBtn.addEventListener('click', function () {
      stashConfigs();
      toggleFormEnable(true);
    }, false);

    // 保存按钮
    $saveBtn.addEventListener('click', function () {
      saveConfigs();
      toggleFormEnable(false);
    }, false);

    // 取消按钮
    $cancelBtn.addEventListener('click', function () {
      restoreConfigs();
      toggleFormEnable(false);
    }, false);
  }

  init();
})();
