(function(global){
  var USER_REF   = /@([a-z0-9]+)/igm
  var ISSUE_REF  = /(^| )(#([0-9]+))/gm

  var USER_SPAN   = '<span class="gh-ref gh-user-ref" data-gh-user="$1">$&</span>';
  var ISSUE_SPAN  = '$1<span class="gh-ref gh-issue-ref" data-gh-issue="$3">$2</span>';

  global.extractGithubReferences = function(str){
    return str.replace(USER_REF, USER_SPAN)
              .replace(ISSUE_REF, ISSUE_SPAN);
  };
})(this);
