const axios = require('axios')
const cheerio = require('cheerio')

class MarktplatzQuery {
  constructor(options)  {
    this.baseUrl = 'https://www.marktplaats.nl/z.html';
    this.queryOptions = {
      query: options.query,           // query substring
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
      if (value && typeof(value) === 'string') params.push([key, value])
      if (value && Array.isArray(value)) params.push([key, value.join(', ')])
    }

    // if params are defined add them to url constructor
    if (params) {
      urlParams = new URLSearchParams(params)
      url.search = urlParams.toString()
    }

    return url.toString()
  }
}



// WH-1000XM3 Query
const searchOptions = {
  query: '1000', // WH-1000XM3
  categoryId: 37, // headpghones
  attributes: [
    'S,256',
    'S,76',
    'M,8846',
    'M,8847',
  ],
  startDateFrom: 'always'
}


const queryMarktplatz = async searchOptions => {
  const url = new MarktplatzQuery(searchOptions).getUrl()
  const result = await axios.get(url)
  const $ = cheerio.load(result.data)
  const ads = []

  $('.search-result .listing').each((i, el) => {
    
    const ad = {
      title: $(el).find('.mp-listing-title').text(),
      description: $(el).find('.mp-listing-description').text(),
      price: $(el).find('.price-new').text(),
    }

    ads.push(ad)

  })
  
  console.log(ads)
}

queryMarktplatz(searchOptions)