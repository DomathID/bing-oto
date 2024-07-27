const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xml2js = require('xml2js');

// Fungsi untuk mendapatkan artikel terbaru dari sitemap
async function getLatestArticlesFromSitemap(sitemapUrl) {
    const response = await axios.get(sitemapUrl);
    const sitemap = await xml2js.parseStringPromise(response.data);
    return sitemap.urlset.url.map(url => ({
        loc: url.loc[0],
        lastmod: url.lastmod ? new Date(url.lastmod[0]) : null
    }));
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
    try {
        const sitemapUrl = 'https://www.yukinoshita.web.id/sitemap.xml';
        const latestArticles = await getLatestArticlesFromSitemap(sitemapUrl);

        // Urutkan artikel berdasarkan tanggal pembaruan (jika ada)
        latestArticles.sort((a, b) => (b.lastmod ? b.lastmod - a.lastmod : 0));

        console.log(`Found ${latestArticles.length} articles to submit.`);

        let count = 0;
        for (const article of latestArticles) {
            if (count >= 100) break;
            await submitUrlToBing(article.loc);
            console.log(`Submitted URL: ${article.loc}`);
            count++;
        }

        // Perbarui file LAST_UPDATED
        const now = new Date().toISOString();
        const lastUpdatedFile = path.join(__dirname, 'LAST_UPDATED');
        fs.writeFileSync(lastUpdatedFile, now);
        console.log(`LAST_UPDATED updated to ${now}`);
    } catch (error) {
        console.error('Error occurred:', error);
    }
})();
