const cheerio = require('cheerio')
const request = require('request')
const url = require('url')
const util = require('util')
const fs = require('fs')
// const crawler = require('crawler')

let stop = false;

console.log('Trying to crawl')
// while (!stop) {

// }

let baseUrl = 'https://www.vanitiesdepot.com/'
let collectionUrl = 'https://www.vanitiesdepot.com/collections/all?_=pf&page=1'

let req = request(collectionUrl,{
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
    },

}, (err, res, body) => {
    console.log('requested')
    if (err) {
        console.log('An error occured')
        console.log(err)
    } else {
        let data = collectionProcessing(body)
        fs.writeFileSync('data', JSON.stringify(data))
        fs.writeFileSync('data.html', body)
    }
})

function collectionProcessing(body) {
    let $ = cheerio.load(body)
    let id = 1
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