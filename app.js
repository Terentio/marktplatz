const axios = require('axios')
const fs = require('fs')

const path = require('path')
const cheerio = require('cheerio')

const dataDir = path.join(__dirname + '/data')

class MarktplatzQuery {
  constructor(options) {
    this.baseUrl = 'https://www.marktplaats.nl/z.html';
    this.queryOptions = {
      query: options.query, // query substring
      categoryId: options.categoryId, // category id of query
      attributes: options.attributes, // array of attributes
      postcode: options.postcode,
      distance: options.distance,
    }
  }

  getUrl() {
    const url = new URL(this.baseUrl);
    let urlParams
    let params = []

    // construct query params
    for (let key in this.queryOptions) {
      const value = this.queryOptions[key];

      // marktlplatz accepts arrays and strings as query values
      if (value && typeof (value) === 'string') params.push([key, value])
      if (value && Array.isArray(value)) params.push([key, value.join(', ')])
    }

    // if params are defined add them to url constructor
    if (params) {
      urlParams = new URLSearchParams(params)
      url.search = urlParams.toString()
      console.log('Params in list')
      console.log(params)
      console.log('\n\n\n')
      console.log(`params added: ${url.search}`)
    }

    return url.toString()
  }
}



// WH-1000XM3 Query
const searchOptions = {
  query: '1000', // WH-1000XM3
  categoryId: 37, // headpghones

  attributes: [
    'S,30',
    'S,256',
    'S,76',
    'M,8846',
    'M,8847'
  ],
  startDateFrom: 'always'
}


const queryMarktplatz = async searchOptions => {
  const url = new MarktplatzQuery(searchOptions).getUrl()
  console.log(`Querying url: ${url}`)
  const result = await axios.get(url)
  const $ = cheerio.load(result.data)
  const ads = []

  $('.search-result').each((i, el) => {
    // console.log($(el).data())

    const ad = {
      id: $(el).data('itemId'),
      title: $(el).find('.listing .mp-listing-title').text().trim(),
      description: $(el).find('.listing .mp-listing-description').text().trim(),
      price: $(el).find('.listing .price-new').text().trim(),
    }

    if (ad.id) ads.push(ad)

  })

  return ads
}

queryMarktplatz(searchOptions)
  .then(res => console.log(res))