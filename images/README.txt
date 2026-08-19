收款码图片放在这个文件夹里：

1. 微信收款码 命名为 wechat-qr.png
2. 支付宝收款码 命名为 alipay-qr.png

然后在 js/config.js 中把这两行改为：

    wechatQr: "images/wechat-qr.png",
    alipayQr: "images/alipay-qr.png",

保存后刷新网页，下单后即可显示收款码。
