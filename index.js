const cheerio = require('cheerio')
const url = require('url')
const { Builder, By, Key, until} = require('selenium-webdriver')
const MongoClient = require('mongodb').MongoClient
const fs = require('fs')
// const crawler = require('crawler')

let stop = false;

console.log('Trying to crawl')

let baseUrl = 'https://www.vanitiesdepot.com/'
let collectionUrl = 'https://www.vanitiesdepot.com/collections/all?_=pf&page=:id'
let page = 1
let dataArr = [];
// while (!stop) {
//     (async function() {
//         let driver = await new Builder().forBrowser('chrome').build();
//         try {
//             await driver.get(collectionUrl.replace(':id', page));
//             await driver.sleep(5000)
    
//             let document = await driver.getPageSource()
    
//             if (cheerio.load(document)('#bc-sf-filter-products>.grid__item').length > 0) {
//                 let data = collectionProcessing(document)
//                 dataArr = [...dataArr, ...data]
//                 page += 1;
//             } else {
//                 stop = true
//             }
//         } catch (error) {
            
//         } finally {
//             driver.quit()
//         }
//     } 
//     )();
// }

(async function() {
    while(!stop && page != 5) {
        let driver = await new Builder().forBrowser('chrome').build();
        try {
            await driver.get(collectionUrl.replace(':id', page));
            await driver.sleep(1500)

            let document = await driver.getPageSource()

            if (cheerio.load(document)('#bc-sf-filter-products>.grid__item').length > 0) {
                let data = collectionProcessing(document)
                dataArr = [...dataArr, ...data]
                page += 1;
            } else {
                stop = true
            }
        } catch (error) {
            
        } finally {
            driver.quit()
        }
    }
} 
)().then(() => {
    fs.writeFileSync('data.json', JSON.stringify(dataArr))
});



const dbUri = "mongodb+srv://thanhdnv:" + encodeURI('brodOz8JTkI6W18y') + "@mongo1-c2nh2.azure.mongodb.net/test?retryWrites=true&w=majority"
const client = new MongoClient(dbUri, {
    useNewUrlParser: true
})
// client.connect(async function(error, db) {
//     if (error) {
//         console.log(error)
//     } else {
//         let db = client.db()
//         await db.listCollections({name: 'vanitiesdepot'}).next(async (err, collinfo) => {
//             if (err) {
//                 console.log('unable to check for collection:', err)
//             } else {
//                 async function insertData() {
//                     console.log('inserting data to the database')
//                 }
//                 let hasCol = true
//                 if (!collinfo) {
//                     hasCol = false
//                     console.log('creating collection')
//                     await db.createCollection('vanitiesdepot', async (error, result) => {
//                         if (error) {
//                             console.log('Unable to create collection:', error)
//                         } else {
//                             hasCol = true
//                         }
//                     })
//                 }
//                 if (hasCol) {
//                     await insertData()
//                 }
//             }
//         })
//     }
//     client.close();
// })

// let req = request(collectionUrl,{
//     headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
//     },

// }, (err, res, body) => {
//     console.log('requested')
//     if (err) {
//         console.log('An error occured')
//         console.log(err)
//     } else {
//         let data = collectionProcessing(body)
//         fs.writeFileSync('data', JSON.stringify(data))
//         fs.writeFileSync('data.html', body)
//     }
// })

let id = 1
function collectionProcessing(body) {
    let $ = cheerio.load(body)    
    console.log($('#bc-sf-filter-products>.grid__item').length)
    let arr = []
    $('#bc-sf-filter-products>.grid__item').each(function(index) {
        let element = $(this)

        let item = element.find('.product-grid--title>a')

        let name = item.text()
        let link = item.attr('href')
        link = url.resolve(baseUrl, link)

        let price_div = element.find('.product-grid--price')
        let comparePrice = price_div.find('.product-grid--compare-price').text()
        //console.log(comparePrice)
        let price = price_div.find('.money').text()
        //console.log(price)

        let img = element.find('#collection-image-anim').attr('src')
        let imgLink = url.resolve('https://', img.replace(/['"']+/, ""))

        let item_obj = {
            id,
            name,
            link,
            comparePrice,
            price,
            img: imgLink
        }
        id += 1;
        arr.push(item_obj)

        // let hidden_img = element.find('.grid-view-item-image .hidden>img')
        // console.log(hidden_img.attr('src'))
        // console.log(item_obj)
    })

    return arr
}