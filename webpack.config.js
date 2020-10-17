const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/Main.ts',
    devtool: 'inline-source-map',
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    output: {
        filename: 'blaster.js',
        library: 'Blaster',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('scooby'),
            BLASTER_VERSION: JSON.stringify(true),
        })
    ],
    target: "web",
    node: {
        fs: 'empty'
    }
};
