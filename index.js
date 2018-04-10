'use strict';

var requestpromise = require('request-promise');
var querystring = require('querystring');
var providers = require('./providers.json');

hexo.extend.tag.register('oembed', function(args){
  if (!args || !providers) return;

  var params = {
    url: args[0],
    format: "json"
  };

  var endpoint = '', provider;
  for (var i = 0; i < providers.length; i++) {
      provider = providers[i];
      if (params.url.match(new RegExp(provider.test))) {
          endpoint = provider.endpoint;
          if (provider.params) {
            params =  Object.assign(params, provider.params);
          }
          break;
      }
  }
  
  if (!endpoint) {
      return;
  }

  var getRequest = function(uri){
    return requestpromise({
      uri: uri,
      transform2xxOnly: true,
      transform: function(body){
        return JSON.parse(body);
      }
    });
  };

  var req = endpoint + '?' + querystring.stringify(params);
  return getRequest(req)
    .then(function(data){
      switch(data.type){
        case 'photo':
          var alt = data.title ? ' alt="'+data.title+'"' : '';
          return '<a href="'+params['url']+'"><img src="'+data.url+'"'+alt+'></a>';
          break;
        case 'video':
        case 'rich':
          return data.html;
          break;
        default:
          return;
          break;
      }
    })
    .catch(function(err){
      console.log(err.statusCode+': '+req);
    });
},{
  async: true
});
