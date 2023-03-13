const webpack = require('webpack');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const secrets = require('./secrets.json');
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const isDev = mode === 'development';

console.log('mode: ', mode)
console.log('isDev: ', isDev)

const plugins = [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: '[name]-styles.css'
    }),
    new webpack.DefinePlugin({
        'API_ENDPOINT_GET_CHART': '"' + secrets.API_ENDPOINT_GET_CHART + '"',
        'API_HOST': '"' + secrets.API_HOST + '"',
    }),
]

if (!isDev) {
    plugins.push(
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
        })
    )

}


if (isDev) {
    plugins.push(new webpack.HotModuleReplacementPlugin());

    plugins.push(new HtmlWebpackPlugin({
        title: 'title title title',
        template: './src/localtesting/index.html',
        inject: false
    }))
}

module.exports = {
    devtool: 'source-map',
    entry: isDev ? {
        griffin: './src/index.js',
        loadGriffin: './src/loadGriffin-local.js'

    } : {
        griffin: './src/index.js',
        loadGriffin: './src/loadGriffin.js'
    },
    externals: {
        Highcharts: "Highcharts"
    },
    mode,
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
        filename: '[name].js?v=[hash:6]',
        // chunkFilename: '[name].[id].js',
    },
    plugins,
    resolve: {
        alias: {
            "@Submodule": path.resolve('submodules')
        }
    },
};