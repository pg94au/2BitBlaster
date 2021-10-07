const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

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
        }),
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
    node: {
        fs: 'empty'
    }
};
