const fs = require('fs');
const convert = require('xml-js');
const fetch = require('node-fetch');
const options = { compact: true, ignoreComment: true, spaces: 4 };
const API = 'https://whale-app-toyuq.ondigitalocean.app/shader-learning-api';

const untrackedUrlsList = [];

/*
    Method to Fetch dynamic List of URLs from Rest API/DB
*/
const fetchModules = () => {
    fetch(`${API}/modules/list`)
        .then(res => res.json())
        .then(dataJSON => {
            if (dataJSON) {
                dataJSON.filter(element => !element.locked).forEach(element => {
                    untrackedUrlsList.push(`https://shader-learning.com/module-progress/${element.id}/view`);
                });
                filterUniqueURLs();
            }
        })
        .catch(error => {
            console.log(error);
        });
}

/*
    Method to Filter/Unique already existing URLs and new urls we fetched from DB
*/
const filterUniqueURLs = () => {
    fs.readFile('src/sitemap.xml', (err, data) => {
        if (data) {
            const existingSitemapList = JSON.parse(convert.xml2json(data, options));
            let existingSitemapURLStringList = [];
            if (existingSitemapList.urlset && existingSitemapList.urlset.url && existingSitemapList.urlset.url.length) {
                existingSitemapURLStringList = existingSitemapList.urlset.url.map(ele => ele.loc._text);
            }

            const date = new Date();
            const year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
            const month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
            const day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
            const dateFormatted = `${year}-${month}-${day}`;

            untrackedUrlsList.forEach(ele => {
                if (existingSitemapURLStringList.indexOf(ele) == -1) {
                    existingSitemapList.urlset.url.push({
                        loc: {
                            _text: ele,
                        },
                        changefreq: {
                            _text: 'monthly'
                        },
                        priority: {
                            _text: 0.8
                        },
                        lastmod: {
                            _text: dateFormatted
                        }
                    });
                }
            });
            createSitemapFile(existingSitemapList);
        }
    });
}

/*
    Method to convert JSON format data into XML format
*/
const createSitemapFile = (list) => {
    const finalXML = convert.json2xml(list, options); // to convert json text to xml text
    saveNewSitemap(finalXML);
}

/*
    Method to Update sitemap.xml file content
*/
const saveNewSitemap = (xmltext) => {
    fs.writeFile('src/sitemap.xml', xmltext, (err) => {
        if (err) {
            return console.log(err);
        }

        console.log("The sitemap.xml file is updated!");
    });
}

fetchModules();