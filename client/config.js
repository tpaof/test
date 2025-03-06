const isProd = process.env.NODE_ENV === 'production';

const config = {
    isProd,
    serverUrlPrefix: isProd ? 'https://w05.pupasoft.com/' : 'http://localhost:1337'
}

export default config;