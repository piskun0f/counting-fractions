const htmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

const fronendConfig = {
    entry: "./src/app/index.ts",
    output: {
        filename: "app.js",
        path: __dirname + "/dist/app"
    },
    plugins: [
        new htmlWebpackPlugin({template: "./src/app/index.html"})
    ],
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                use: {loader: "babel-loader"}
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    }
}

const backendConfig = {
    target: "node",
    node: {
        __dirname: true
    },
    entry: "./src/server/index.ts",
    output: {filename: "server.js"},
    resolve: {
        extensions: ['.js', '.ts']
    },
    module: {
        rules: [
            {
                test: /\.[jt]s$/,
                use: {loader: "babel-loader"}
            }
        ]
    },
    externals: [nodeExternals()]
}

module.exports = [fronendConfig, backendConfig];
