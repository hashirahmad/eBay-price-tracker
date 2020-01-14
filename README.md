# eBay-price-tracker
Takes list of eBay URLs and tracks them for new products, new deals and sends an email when new product comes below a certain criteria<br>
***This is a side project.*** <br>
***It is not production ready code***<br>

## Why?
eBay does have similar feature where you can get notfied by email for new products but this email tends to be on ***daily basis***<br>
In the mean time a lot of products can come online and be sold long before the daily email is sent to your email<br>
<br>
The script does not use any eBay API<br>
You do not need any eBay account for this to work<br>
<br>
Email will only be send if it is a new product listed<br>
In the email - it sends description as well so everything remains inside your inbox for your convinience<br>
<br>
## Step 1 - Setting up `config.json`
Make sure `config.json` is populated correctly.

    {
		"urlsToTrack":  [{
			"url":  "",
			"belowWhatPrice":  0,
			"lastListedItem":  {
				"title":  "",
				"newListing":  true,
				"price":  0,
				"url":  "",
				"fastNfree":  false,
				"postage":  "0",
				"bestOffer":  false
			}
		}],
		"howOftenInMins":  10,
		"chrome":  {
			"headless":  true,
			"x":  1400,
			"y":  1000,
			"devtools":  false
		},
		"email":  {
			"readme":  "You will need to enable LESS SECURE APPS from Google setting. Essential it is!",
			"sendEmailTo":  "YOUR EMAIL",
			"gmail":  {
				"username":  "YOUR EMAIL",
				"password":  "YOUR EMAIL PASSWORD"
			}
		}
	}
<br>

`url` needs to be complete URL and it needs to be sorted by **Newly Listed**. This is an example of a [complete URL](https://www.ebay.co.uk/sch/i.html?_from=R40&_nkw=iphone%2011%20pro%20max&_sacat=0&LH_BIN=1&Storage%2520Capacity=512%2520GB&Network=Unlocked&_dcat=9355&_udhi=1,200&_udlo=1000&_sop=10)
<br>
`belowWhatPrice` - this feature has not been developed yet!
<br>
`howOftenInMins` - how often basically it should look for the newly listen items. Just remember: It needs to be in minutes!
<br>
`chorme.headless` - if you want to see the LIVE action of how it is done
<br>
`email.sendEmailTo` - This is the email to which the email will be sent to containing new item
<br>

### ***Word of Caution!***
You need to enable Google's **LESS SECURE Apps** settings otherwise `email.gmail.username` and `email.gmail.password` will not work correctly. Mainly because of self signed certificate - I believe this will not be an issue on a real server!

## Step 2
run `node index.js` and follow the ***on-screen instructions***
**Enjoy!**

## Bugs
Let me know!