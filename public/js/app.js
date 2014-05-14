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
      this.resource('issue', {path: 'issues/:issue'});
    });
  });
});

App.IndexController = Ember.Controller.extend({
  where: null,

  actions: {
    go: function(){
      var path = this.get('where').split(/\/|#/);

      if(path.length === 1){
        this.transitionToRoute('user', path[0]);
      }else if(path.length === 2){
        this.transitionToRoute('repository', path[0], path[1]);
      }else{
        this.transitionToRoute('issue', path[0], path[1], path[2]);
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

App.GhMarkdownComponent = Ember.Component.extend({
  text: null,

  processedText: function(){
    var text = this.get('text');

    text = marked(text, {
      sanitize: true,
      highlight: function(code, lang){
        return lang ? hljs.highlight(lang, code, true).value : code;
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

App.RelativeTimeComponent = Ember.Component.extend({
  time: null,

  relativeTime: function(){
    return moment(this.get('time')).fromNow();
  }.property('time')
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

App.RepositoryRoute = Ember.Route.extend({
  model: function(params){
    var user = this.modelFor('user').login;
    return $.getJSON(GHAPI + 'repos/' + user + '/' + params.repository);
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
    return $.getJSON(GHAPI + 'repos/' + repo + '/issues');
  }
});

App.IssueRoute = Ember.Route.extend({
  actions: {
    goToIssue: function(issue){
      this.transitionTo('issue', issue);
    },

    goToUser: function(user){
      this.transitionTo('user', user);
    }
  },

  model: function(params){
    var repo = this.modelFor('repository').full_name;
    var issueUrl = GHAPI + 'repos/' + repo + '/issues/' + params.issue;

    var issuePromise    = $.getJSON(issueUrl);
    var commentsPromise = $.getJSON(issueUrl + '/comments');

    return Ember.RSVP.all([issuePromise, commentsPromise]).then(function(results){
      var issue = results[0], comments = results[1];

      issue.comments = comments;

      return issue;
    });
  }
});

Ember.Handlebars.registerBoundHelper('relative-time', function(time) {
  return moment(time).fromNow();
});

Ember.Handlebars.registerBoundHelper('pluralize', function(str, number, opts) {
  return (number === 1) ? str : (str + 's');
});
