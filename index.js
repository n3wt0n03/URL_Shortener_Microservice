require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const { MongoClient } = require('mongodb');
const urlParser = require('url');
const dns = require('dns');
const { url } = require('inspector');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

const client = new MongoClient(process.env.DB_URL, {});
const db = client.db('freeCodeCamp_Projects');
const urls = db.collection('URLShortener');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/api/shorturl', (req, res) => {
  const var_url = req.body.url;
  const dns_lookup = dns.lookup(urlParser.parse(var_url).hostname, 
        async (error, address) => {
          if(!address){
            res.json({error: 'invalid url'});
          } else {
            const url_count = await urls.countDocuments({})
            const url_doc = {
              original_url: var_url,
              short_url: url_count
            }
            const result = await urls.insertOne(url_doc);
            console.log(result);

            res.json({
              original_url: var_url,
              short_url: url_count
            })
          }
        })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  const short_url = req.params.short_url;
  const url_doc = await urls.findOne({short_url: +short_url})
  res.redirect(url_doc.original_url);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
