App = Ember.Application.create();

App.Router.map(function(){
  this.resource('user', {path: '/:username'}, function(){
    this.resource('repository', {path: '/:repository'}, function(){
      this.resource('issue', {path: '/issues/:issue'});
    });
  });
});
