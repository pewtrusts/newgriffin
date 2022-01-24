const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const secrets = require('./secrets.json');
module.exports = {
    devtool: 'source-map',
    entry: {
        griffin: './src/index.js'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader']
                // will sourcemaps work?
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                    },
                },
            }),
            new CssMinimizerPlugin()
        ]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),

    },
    plugins: [
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: '[name]-styles.css'
        }),
        new webpack.SourceMapDevToolPlugin({
            test: /\.js/,
            filename: '[name]js.map',
            module: true,
            moduleFilenameTemplate: info => {
                return `webpack:///${info.resourcePath}?${info.hash}`;
            },
        }), new webpack.SourceMapDevToolPlugin({
            test: /\.css/,
            filename: '[name]css.map',
            module: true,
            moduleFilenameTemplate: info => {

                return `webpack:///${info.resourcePath}?${info.hash}`;
            },
        }),
        new webpack.DefinePlugin({
            'API_ENDPOINT_GET_CHART': '"' + secrets.API_ENDPOINT_GET_CHART + '"',
        }),
    ],
    resolve: {
        alias: {
            "@Submodule": path.resolve('submodules')
        }
    },
};