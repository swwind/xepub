const path = require('path');

module.exports = {
  entry: {
    main: './src/index.ts'
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'xepub.min.js'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
      }, {
        test: /\.less$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false }
          },
          'less-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.json', '.less']
  }
};