const path = require('path');

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
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    output: {
        filename: 'blaster.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
