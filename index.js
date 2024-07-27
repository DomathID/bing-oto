const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

// Fungsi untuk mendapatkan semua artikel dari sitemap
async function getArticlesFromSitemap(sitemapUrl) {
    const response = await axios.get(sitemapUrl);
    const sitemap = await xml2js.parseStringPromise(response.data);
    return sitemap.urlset.url.map(url => url.loc[0]);
}

// Fungsi untuk mengirim URL batch ke Bing
async function submitUrlsToBing(urls) {
    const apiKey = process.env.BING_API_KEY;
    const siteUrl = 'https://www.yukinoshita.web.id';
    try {
        const response = await axios.post(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${apiKey}`, {
            siteUrl,
            urlList: urls
        });
        return response.data;
    } catch (error) {
        console.error(`Error submitting URLs:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

(async () => {
    try {
        const sitemapUrl = 'https://www.yukinoshita.web.id/sitemap.xml';
        const articles = await getArticlesFromSitemap(sitemapUrl);

        console.log(`Found ${articles.length} articles in sitemap.`);

        const urlsToSubmit = articles.slice(0, 100);
        await submitUrlsToBing(urlsToSubmit);
        console.log(`Submitted ${urlsToSubmit.length} URLs to Bing.`);
    } catch (error) {
        console.error('Error occurred:', error);
    }
})();
