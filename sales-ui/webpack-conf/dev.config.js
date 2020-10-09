const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
    app: path.join(__dirname, '..', 'app'),
    build: path.join(__dirname, '..', 'public')
};

process.env.BABEL_ENV = TARGET;

const common = {
    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    },
    entry: {
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        filename: 'bundle.[hash].js'
    },
    module: {
        loaders: [
            {
                test: /\.json?$/,
                loaders: ['json-loader']
            },
            {
                test: /\.jsx?$/,
                loaders: ['babel?cacheDirectory'],
                include: PATHS.app
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({"BACKGROUND_COLOR": JSON.stringify("#7CB342")}),
        new HtmlWebpackPlugin({
            title: 'Dev Env',
            resources: '/ui/static',
            template: PATHS.build + '/index.ejs'
        })
    ]
};


if(TARGET === 'build' || !TARGET) {
    module.exports = merge(common, {
        devtool: 'eval-source-map'
    });
}