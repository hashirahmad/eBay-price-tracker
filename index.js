const arg = require("yargs").argv
const chrome = require('puppeteer')
const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')
const cliProgress = require("cli-progress")
const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
const prompt = require('prompt')
const config = jsonfile.readFileSync('./config.json')
const email = require('./email')


cli()

function sleep(sec) {
    return new Promise( res => {

        progressBar.start(sec, 0)
        let progressValue = 0
        let incrementer = setInterval(() => {
            progressBar.update( ++progressValue )
        }, 1000)

        setTimeout( () => {
            clearInterval(incrementer)
            progressBar.stop()
            res()
        }, sec * 1000 );

    })
}

async function saveConfig(json) {

    let filePath = './config.json'
    try {
        await jsonfile.writeFile(filePath, json, {
            spaces: 4
        })
        console.log(filePath, 'successfully updated')
    } catch (e) {
        console.error('Error happened while updating', filePath, '\nHere is the error: \n\n', e)
    }
}

function cli() {
        
    console.log( JSON.stringify(config, null, 4), '\n\n' )

    prompt.start()
    let questions = [
        `Confirm the above configuration Press [ENTER] to continue . . .`
    ]

    prompt.get([questions[0]], function(err, result) {
        
        if (err) {
            return onErr(err)
        }
        run()
    
    })

}

function onErr(err) {
    console.log(err)
    return 1
}

async function run() {
    
    let options = {
        width: config.chrome.x,
        height: config.chrome.y
    }
    const browser = await chrome.launch({
        headless: config.chrome.headless,
        devtools: config.chrome.devtools,
        args: [`--window-size=${options.width},${options.height}`]
    })

    const page = await browser.newPage()
    await page.setViewport({
        width: options.width,
        height: options.height,
        deviceScaleFactor: 1,
    })

    job(page)  
}

async function getDescriptionsSendEmail( items, page ) {
    
    for (let i in items) {
        
        let item = items[i]
        
        await page.goto(item.url)
        await page.waitForSelector('#desc_ifr')
        let descriptionURL = await page.evaluate(() => {
            return document.querySelector('#desc_ifr').src
        })
        
        await page.goto(descriptionURL)
        let description = await page.evaluate(() => {
            return window.ds_div.outerText
        })

        item.description = description
        console.log('Sending email =>', item.title )
        email.send(item)
        
    }
    return items
    
}

function extractProduct(lastItem) {
    
    let items = Array.from( document.querySelector('.b-list__items_nofooter').children )
    let products = []
    for ( let i in items ) {
        
        let item = items[i]
        let product = {
            title: item.querySelector('.s-item__title').textContent.replace('New listing', '')
            , newListing: item.querySelector('.s-item__title').textContent.startsWith('New listing')
            , price: parseFloat( item.querySelector('.s-item__price').textContent.replace('£', '') )
            , url: item.querySelector('.s-item__image').firstElementChild.href
            , fastNfree: item.querySelector('.s-item__fnf') ? true : false
            , postage: 0
            , bestOffer: false
        }
        
        if ( lastItem.url === product.url ) {
            return products
        } else {
            
            if ( item.querySelector('.s-item__shipping.s-item__logisticsCost') ) {
                
                product.postage = item.querySelector('.s-item__shipping.s-item__logisticsCost').textContent
                
            }
            
            if ( item.querySelector('.s-item__purchase-options.s-item__purchaseOptions') ) {
                
                let bestOffer = item.querySelector('.s-item__purchase-options.s-item__purchaseOptions').textContent
                product.bestOffer = bestOffer.includes('Best Offer')
                
            }
            products.push( product )
            
        }
        
    }
    return products
    
}

async function job(page){

    for ( let u in config.urlsToTrack ){

        let ebay = config.urlsToTrack[u]
        await page.goto( ebay.url )
        
        /*
            I stringify the function purely to keep
            the large function separate from this 
            "job" function
            Otherwise the function can get largely big
            
            This way function is kept separate using
            "eval" function as passing the function
            does not work. It needs to be defined 
            inside the scope
        */
        let stringifiedFunction = `(${extractProduct.toString()})`
        let newItems = await page.evaluate( (lastItem, extractProduct) => {
            
            extractProduct = eval(extractProduct)
            return extractProduct(lastItem) 

        }, config.urlsToTrack[u].lastListedItem, stringifiedFunction )
        
        config.urlsToTrack[u].lastListedItem = newItems[0]
        await saveConfig(config)
        newItems = await getDescriptionsSendEmail( newItems, page )
        
    }

    console.log('\n\n\nAll URLs have been tracked. Waiting for', config.howOftenInMins, 'minutes . . .')
    await sleep( 60 * config.howOftenInMins )
    job(page)

}