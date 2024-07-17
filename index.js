const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

// Baca timestamp dari LAST_UPDATED
const lastUpdatedFile = path.join(__dirname, 'LAST_UPDATED');
const lastUpdated = fs.existsSync(lastUpdatedFile) ? fs.readFileSync(lastUpdatedFile, 'utf-8') : null;

// Fungsi untuk mendapatkan artikel terbaru dari sitemap
async function getLatestArticlesFromSitemap(sitemapUrl, lastUpdated) {
    const response = await axios.get(sitemapUrl);
    const sitemap = await xml2js.parseStringPromise(response.data);
    const urls = sitemap.urlset.url.map(url => ({
        loc: url.loc[0],
        lastmod: url.lastmod ? new Date(url.lastmod[0]) : null
    }));

    if (lastUpdated) {
        const lastUpdatedDate = new Date(lastUpdated);
        return urls.filter(url => url.lastmod && url.lastmod > lastUpdatedDate);
    } else {
        return urls;
    }
}

// Fungsi untuk mengirim URL ke Bing
async function submitUrlToBing(url) {
    const apiKey = process.env.BING_API_KEY;
    const response = await axios.post(`https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=${apiKey}`, {
        url
    });
    return response.data;
}

(async () => {
    const sitemapUrl = 'https://www.yukinoshita.web.id/sitemap.xml';
    const latestArticles = await getLatestArticlesFromSitemap(sitemapUrl, lastUpdated);
    let count = 0;
    for (const article of latestArticles) {
        if (count >= 100) break;
        await submitUrlToBing(article.loc);
        count++;
    }
})();
