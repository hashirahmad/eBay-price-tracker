const nodemailer = require('nodemailer')
const jsonfile = require('jsonfile')
const config = jsonfile.readFileSync('./config.json')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.gmail.username,
        pass: config.email.gmail.password
    },
    tls: {
        rejectUnauthorized: false
    }
})

var mailOptions = {
    from: config.email.gmail.username,
    to: config.email.sendEmailTo,
    subject: '',
    html: ''
}


function toHTML(params) {
    
    let html = 
    `
    <div style="background-color: #03A9F4;
        padding: 15px;
        border-radius: 15px;
        border: 5px dotted;
        font-size: 30px;
        margin-bottom: 5px;"
    >
        <h6 style="text-align: center; color: white; font-size: 30px">${params.title}</h6>
        <h6 style="color: white;">Best Offer: ${params.bestOffer} | £${params.price} | £${params.postage} Postage costs</h6>

    </div>
    <div style="background-color: #8839e2;
        padding: 15px;
        border-radius: 15px;
        border: 5px dotted;
        font-size: 30px;
        margin-bottom: 5px"
    >
        <p style="color: white; font-size: 15px;">${params.description}</p>
        <a href="${params.url}" style="padding: 10px; 
            background-color: #f37aa3; 
            font-size: 25px; 
            color: #3F51B5; 
            border-radius: 15px; 
            border: 5px dotted;"
        >
            More Information
        </a>
    </div>
    `
    return html
        
}
    
function send( item ){

    if (
        item.title && 
        item.price &&
        item.postage !== undefined &&
        item.url &&
        item.description &&
        item.bestOffer !== undefined
    ) {

        mailOptions.subject = `£${item.price} | ${item.title}`
        mailOptions.html = toHTML( item )
    
        transporter.sendMail( mailOptions, function (error, info) {
            if (error) {
                console.log('Error happened while sending email\n', JSON.stringify( error, null, 4 ) );
            } else {
                console.log('Email sent =>', item.title, ' | ', info.response, '\n\n');
            }
        })

    } else {
        console.log('Invalid params.\nTry again.', JSON.stringify(item, null, 4) )
        return false
    }

}

module.exports = {
    send
}