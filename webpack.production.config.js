var path = require('path');
var webpack = require('webpack');
var ROOT = path.resolve(__dirname);
var htmlwebpackplugin = require('html-webpack-plugin');
var cleanwebpackplugin = require('clean-webpack-plugin');
var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var ENTRY = path.resolve(ROOT, 'src', 'index.js');
var SRC = path.resolve(ROOT, 'src');
var DIST = path.resolve(ROOT, 'dist');
var DLL = '/dll/dll.vendor.js';
var manifest = require('./dll/vendor-manifest.json');

var plugins = [
        new cleanwebpackplugin([DIST]),
        new htmlwebpackplugin(
            {
                title: 'APP',
                template: './public/index.html',
                chunks: ['index'],
                filename: 'index.html',
                vendor: DLL,
                inject: 'body',
                minify: {
                    removeComments: true,
                    collapseWhitespace: false,
                }
            }
        ),
        new CopyWebpackPlugin([
            {from: './dll', to:'./dll'}
        ]),
        new MiniCssExtractPlugin({
            filename: 'css/[name]_[hash:8].css',
            allChunks: true
        }),
        // webpack中-p代表--optimize-minimize也就是压缩的意思,cli中progress代表显示编译进度
        // webpack -p压缩的时候不会去掉一些注释，所以在这里可以设置一下，进一步压缩文件
        // 注意：webpack4 不需要

        // DefinePlugin()方法能创建可以在编译时配置的全局常量，这可能是非常有用的，允许开发版本和编译出的版本具有不同的行为
        // 在这里将环境设置为时'production'时，react会自动去掉没有用到的代码部分，让文件进一步精简
        // new webpack.optimize.CommonsChunkPlugin({
        //     name: 'vendor',
        //     filename: 'vendor.bundle.js'
        // }),
        new webpack.DllReferencePlugin({
            context: ROOT,
            manifest
        })
    ];

module.exports = {
    mode: 'production',
    entry: {
        index: ENTRY
    },
    output: {
        path: DIST,
        publicPath: '/',
        filename: 'bundle_[name]_[hash:8].js' //结束最终JS文件
    },

    resolve: {},

    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                uglifyOptions: {
                    warnings: false,
                    compress: {
                        drop_debugger: true,
                        drop_console: true
                    },
                    ecma: 6,
                    mangle: true
                },
                sourceMap: true
            })
        ]
    },

    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader", // 使用babel-loader这个loader
                        options: {
                            presets: ['es2015', 'react', 'stage-3']
                        }
                    }
                ]
            },
            {
                test: /\.(less|scss|css)$/,
                include: SRC,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader?minimize',
                    {
                        loader:'postcss-loader',
                        options: {           // 如果没有options这个选项将会报错 No PostCSS Config found
                            plugins: (loader) => [
                                require('autoprefixer')(), //CSS浏览器兼容
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: ['url-loader?limit=10000&name=assets/[name]_[hash:8].[ext]']
            }
        ]
    },
    plugins: plugins
};
