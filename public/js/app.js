var GHAPI = 'https://api.github.com/';

$.ajaxPrefilter(function(options, _, jqxhr){
  if(options.url.indexOf(GHAPI) === 0){
    var auth = btoa('lololololwut:omgwtfbbq0');
    jqxhr.setRequestHeader('Authorization', 'Basic ' + auth);
  }
});

App = Ember.Application.create();

App.Router.map(function(){
  this.resource('user', {path: '/:user'}, function(){
    this.resource('repository', {path: '/:repository'}, function(){
      this.resource('issue', {path: '/:issue'});
    });
  });
});

App.IndexController = Ember.ObjectController.extend({
  repo: null,

  actions: {
    go: function(){
      var path = this.get('repo').split('/');

      if(path.length === 1){
        this.transitionToRoute('user', path[0]);
      }else if(path.length > 1){
        this.transitionToRoute('repository', path[0], path[1]);
      }
    }
  }
});

App.GhAvatarComponent = Ember.Component.extend({
  url: null,
  size: 140,

  src: function(){
    return this.get('url') + 's=' + this.get('size');
  }.property('url', 'size')
});

App.UserRoute = Ember.Route.extend({
  model: function(params){
    return $.getJSON(GHAPI + 'users/' + params.user);
  }
});

App.UserIndexRoute = Ember.Route.extend({
  model: function(params){
    var user = this.modelFor('user').login;
    return $.getJSON(GHAPI + 'users/' + user + '/repos?per_page=100');
  }
});

App.UserIndexController = Ember.ArrayController.extend({
  sortProperties: ['open_issues_count'],
  sortAscending: false
});
