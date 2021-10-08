const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/Main.ts',
    devtool: 'inline-source-map',
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
        new CopyPlugin({
            patterns: [
                { from: 'index.html', to: '.' },
                {
                    from: 'images',
                    to: 'images',
                    globOptions: {
                        ignore: ['**/_ignore/**/*']
                    }
                },
                { from: 'sounds', to: 'sounds' }
            ]
        })
    ],
    target: "web",
};
