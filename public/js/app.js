var GHAPI = 'https://api.github.com';

$.ajaxPrefilter(function(options, _, jqxhr){
  if(options.url.indexOf(GHAPI) === 0){
    var auth = btoa('lololololwut:omgwtfbbq0');
    jqxhr.setRequestHeader('Authorization', 'Basic ' + auth);
  }
});

// Ember stuff below

App = Ember.Application.create();

App.Router.map(function(){
  this.resource('user', {path: '/:username'}, function(){
    this.resource('repository', {path: '/:repository'}, function(){
      this.resource('issue', {path: '/issues/:issue'});
    });
  });
});

App.UserRoute = Ember.Route.extend({
  model: function(params){
    return $.getJSON(GHAPI + '/users/' + params.username);
  }
});
