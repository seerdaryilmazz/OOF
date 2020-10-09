const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const htmlWebpackPlugin = require('html-webpack-plugin');
const NpmInstallPlugin = require('npm-install-webpack-plugin');

const TARGET = process.env.npm_lifecycle_event;
const PATHS = {
    app: path.join(__dirname, 'app'),
    build: path.join(__dirname, 'public')
};

process.env.BABEL_ENV = TARGET;

const common = {

    // Entry accepts a path or an object of entries. We'll be using the
    // latter form given it's convenient with more complex configurations.
    resolve: {
        extensions: ['', '.js', '.jsx', '.json']
    },
    entry: {
        app: PATHS.app
    },
    output: {
        path: PATHS.build,
        publicPath: "http://localhost:8886/",
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
        new webpack.DefinePlugin({"BACKGROUND_COLOR": JSON.stringify("#E53935")}),
        new htmlWebpackPlugin({
            title: 'Local Env',
            resources: '/static',
            template: 'public/index.ejs' // Load a custom template (ejs by default see the FAQ for details)
        }),
        new NpmInstallPlugin()
    ]
};

// Default configuration. We will return this if
// Webpack is called outside of npm.
if(TARGET === 'start' || !TARGET) {

    module.exports = merge(common, {
        devtool: 'eval-source-map',
        devServer: {
            contentBase: PATHS.build,

            // Enable history API fallback so HTML5 History API based
            // routing works. This is a good default that will come
            // in handy in more complicated setups.
            historyApiFallback: true,
            hot: true,
            inline: true,
            progress: true,

            // Display only errors to reduce the amount of output.
            stats: 'errors-only',

            // Parse host and port from env so this is easy to customize.
            //
            // If you use Vagrant or Cloud9, set
            // host: process.env.HOST || '0.0.0.0';
            //
            // 0.0.0.0 is available to all network devices unlike default
            // localhost
            host: process.env.HOST,
            port: process.env.PORT
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new NpmInstallPlugin({
                save: true // --save
            })
        ]
    });

}

if(TARGET === 'build') {
    module.exports = merge(common, {});
}
