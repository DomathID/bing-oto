const axios = require('axios');
const xml2js = require('xml2js');

const SITEMAP_URL = 'https://yukinoshita.web.id/sitemap.xml';
const BING_API_URL = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${process.env.BING_API_KEY}`;
const URL_LIMIT = 100;

async function fetchSitemap() {
    const response = await axios.get(SITEMAP_URL);
    return response.data;
}

async function parseSitemap(xml) {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xml);
    return result.urlset.url.map(entry => entry.loc[0]);
}

async function submitUrlsToBing(urls) {
    const payload = {
        siteUrl: 'https://yukinoshita.web.id',
        urlList: urls
    };

    const response = await axios.post(BING_API_URL, payload);
    return response.data;
}

async function main() {
    try {
        const xml = await fetchSitemap();
        const urls = await parseSitemap(xml);

        const urlsToSubmit = urls.slice(0, URL_LIMIT);
        console.log(`Submitting ${urlsToSubmit.length} URLs to Bing...`);

        const result = await submitUrlsToBing(urlsToSubmit);
        console.log('Submission Result:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

main();
