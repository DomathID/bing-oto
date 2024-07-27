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

// Fungsi untuk mengirim URL ke Bing
async function submitUrlToBing(url) {
    const apiKey = process.env.BING_API_KEY;
    try {
        const response = await axios.post(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${apiKey}`, {
            url
        });
        return response.data;
    } catch (error) {
        console.error(`Error submitting URL ${url}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

(async () => {
    try {
        const sitemapUrl = 'https://www.yukinoshita.web.id/sitemap.xml';
        const articles = await getArticlesFromSitemap(sitemapUrl);

        console.log(`Found ${articles.length} articles in sitemap.`);

        let count = 0;
        for (const article of articles) {
            if (count >= 100) break;
            await submitUrlToBing(article);
            console.log(`Submitted URL: ${article}`);
            count++;
        }
    } catch (error) {
        console.error('Error occurred:', error);
    }
})();
