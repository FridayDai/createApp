const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: {
        vendor: ['react','react-dom']
    },
    output: {
        path: path.join(__dirname, '/dll'),
        filename: 'dll.[name].js',
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(__dirname, '/dll/[name]-manifest.json'),
            name: '[name]'
        })
    ]
};