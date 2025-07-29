/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://vbdhub.org', // (required) base URL of your site
  generateRobotsTxt: true, // (optional) generate robots.txt
  generateIndexSitemap: false, // (optional) generate index sitemap
  output: 'standalone',
  changefreq: 'weekly' // (optional) change frequency of the sitemap
};
