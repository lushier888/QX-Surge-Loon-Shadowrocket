async function checkGemini() {

  try {

    const resp = await fetch(
      'https://gemini.google.com/app',
      {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 Chrome/122 Safari/537.36'
        }
      }
    );

    const text = await resp.text();

    // 已解锁
    if (
      resp.status === 200 &&
      (
        text.includes('Gemini') ||
        text.includes('Google AI')
      )
    ) {

      return '𝑮𝒆𝒎𝒊𝒏𝒊: 已解锁';

    }

    // 地区限制
    if (
      resp.status === 403 ||
      text.includes('unsupported country')
    ) {

      return '𝑮𝒆𝒎𝒊𝒏𝒊: 未解锁';

    }

    return `𝑮𝒆𝒎𝒊𝒏𝒊: ${resp.status}`;

  } catch(e) {

    return '𝑮𝒆𝒎𝒊𝒏𝒊: 检测失败';

  }

}