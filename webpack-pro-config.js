/**
 * Created by jianghe on 2017/12/25.
 * 部署模式配置文件
 */

var webpack = require('webpack');

module.exports = {
    entry: {
        index: './src/processData.js'
    },
    output: {
        path: __dirname + '/dist',
        filename: 'processData.min.js'
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            mangle: {
                except: ['processData', 'module', 'exports']
            }
        })
    ],
}
