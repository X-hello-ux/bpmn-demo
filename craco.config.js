const CracoAntDesignPlugin = require("craco-antd");

const path = require("path");

module.exports = {
  plugins: [
    {
      // 按需加载UI组件
      plugin: CracoAntDesignPlugin,
      // 支持less
      lessLoaderOptions: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  ],
  // 路径别名
  alias: {
    "@": path.resolve(__dirname, "src"),
  },
};
