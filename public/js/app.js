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

App.UserIndexRoute = Ember.Route.extend({
  model: function(params){
    var username = this.modelFor('user').login;
    return $.getJSON(GHAPI + '/users/' + username + '/repos?per_page=100');
  }
});

App.UserIndexController = Ember.ArrayController.extend({
  sortProperties: ['open_issues_count'],
  sortAscending: false
});

App.RepositoryRoute = Ember.Route.extend({
  model: function(params){
    var username = this.modelFor('user').login;
    return $.getJSON(GHAPI + '/repos/' + username + '/' + params.repository);
  },
  renderTemplate: function(){
    this._super();
    this.render('repository/topbar', {
      into: 'user',
      outlet: 'repository-topbar'
    });
  }
});

App.RepositoryIndexRoute = Ember.Route.extend({
  model: function(params){
    var repo = this.modelFor('repository').full_name;
    return $.getJSON(GHAPI + '/repos/' + repo + '/issues');
  }
});
