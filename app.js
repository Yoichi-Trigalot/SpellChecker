// url config this project helper : https://raddy.dev/blog/nodejs-setup-with-html-css-js-ejs/
const { urlencoded } = require('body-parser');
const { XMLParser, XMLValidator } = require('fast-xml-parser');
const axios = require('axios');
const cors = require('cors');
const express = require('express')
const favicon = require('serve-favicon');
var path = require('path');

// Settings
const _options = {
	ignoreAttributes: false,
	attributeNamePrefix: "_",
	allowBooleanAttributes: true
};
const _parser = new XMLParser(_options);
const _cordialUrl = "https://correction-cordial-en-ligne.azurewebsites.net/correctionCordialSaas"
const requestBody = (text) => {
	return `
	<RequestDataSaas_Apikey>
	<details>
	${text}
	</details>
  <apikey>VgaC47H9CPLq98Y5rJ6p2FZzXBd36et5baw97m7P</apikey>
  <token>null</token>
	</RequestDataSaas_Apikey>`
}

const app = express()
const port = 3000

// Static Files
app.use(express.static('public'));
// Specific folder example
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/images'))

// fav.icon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

// Set View's
app.set('views', './views');
// app.set('view engine', 'ejs');

app.use(urlencoded({ extended: true }));
app.use(express.json())
app.use(cors());

// Navigation
app.get('/', (req, res) => {
	res.render('index', { data: {title:'Spell Checker 101'} })
})

//post request to api
app.post('/', async (req, res) => {
	const { text } = req.body; // get text to check
	let dataXmlFormatted = requestBody(text) // format xml body request

	try {
		const response = await axios.post(_cordialUrl, dataXmlFormatted, {
			headers: { 'Content-Type': 'application/xml' }
		});

		// parse api response as json string
		if (XMLValidator.validate(response.data.corrected)) {
			const result = _parser.parse(response.data.corrected);
			res.set('Content-Type', 'text/json');
			res.send(result);
		} else {
			res.status(500).send("An error occured")
		}
	}
	catch (err) {
		console.log(`An error occurred while accessing cordial Api : ${err}`)
	}
});

app.listen( port, () => console.info(`App listening on port ${port}`))

// Export the Express API
module.exports = app;
