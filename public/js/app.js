var GHAPI = 'https://api.github.com';

$.ajaxPrefilter(function(options, _, jqxhr){
  if(options.url.indexOf(GHAPI) === 0){
    var auth = btoa('lololololwut:omgwtfbbq0');
    jqxhr.setRequestHeader('Authorization', 'Basic ' + auth);
  }
});

// Ember stuff below

Ember.Handlebars.registerBoundHelper('pluralize', function(str, count){
  return (count === 1) ? str : (str + 's');
});

Ember.Handlebars.registerBoundHelper('relative-time', function(time){
  return moment(time).fromNow();
});

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

App.IssueRoute = Ember.Route.extend({
  actions: {
    goToIssue: function(number){
      this.transitionTo('issue', number);
    },

    goToUser: function(username){
      this.transitionTo('user', username);
    }
  },

  model: function(params){
    var repo = this.modelFor('repository').full_name;
    return $.getJSON(GHAPI + '/repos/' + repo + '/issues/' + params.issue);
  }
});

App.GhAvatarComponent = Ember.Component.extend({
  src: null,
  size: null,

  scaledSrc: function(){
    return this.get('src') + 's=' + this.get('size');
  }.property('src', 'size')
});

App.GhMarkdownComponent = Ember.Component.extend({
  text: null,

  processedText: function(){
    var text = this.get('text');

    text = marked(text, {
      sanitize: true,
      highlight: function(code, lang){
        try{
          return hljs.highlight(lang, code, true).value;
        }catch(e){
          return code;
        }
      }
    });

    text = emojify.replace(text);

    text = extractGithubReferences(text);

    return text.htmlSafe();
  }.property('text'),

  click: function(e){
    var $target = $(e.target);

    if($target.hasClass('gh-issue-ref')){
      e.preventDefault();
      this.sendAction('issueRefClicked', $target.data('gh-issue'));
    }else if($target.hasClass('gh-user-ref')){
      e.preventDefault();
      this.sendAction('userRefClicked', $target.data('gh-user'));
    }
  }
});
