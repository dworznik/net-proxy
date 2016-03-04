module.exports = function(config) {
config.set({
    singleRun: true,
    browsers: ['Chrome'],
    // ... normal karma configuration

    files: [{
        pattern: 'index_test.js',
        watched: false
    }],

    preprocessors: {
        // add webpack as preprocessor
        'index_test.js': ['webpack', 'sourcemap']
    },


    webpack: {
        devtool: 'inline-source-map',
        module: {
            loaders: [{
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }, {
                test: /\.json$/,
                loader: 'json-loader'
            }, {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            }],
        }
    },

    webpackMiddleware: {
        // webpack-dev-middleware configuration
        // i. e.
        noInfo: true
    },
    frameworks: ['jasmine'],
    plugins: [
        'karma-chrome-launcher',
        'karma-chai',
        'karma-jasmine',
        'karma-mocha',
        'karma-webpack',
    ]
});
};