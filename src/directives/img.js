angular.module('flow.img', ['flow.init'])
.directive('flowImg', [function() {
  var queue = [];
  var busy = false;
  var fileReader = new FileReader();
  var resolvers = {};

  var processNextThumbail = function () {
    if (!busy) {
      var next = queue.shift();
      if (!next) {
        return;
      }
      busy = true;
      fileReader.readAsDataURL(next.file);
      fileReader.onload = function (event) {
        resolvers[next.uniqueIdentifier](event.target.result);
        busy = false;
        processNextThumbail();
      };
    }
  };
  var getThumbnailUrl = function (file, resolver) {
    if (!file) {
      resolver(null);
      return;
    }
    queue.push(file);
    resolvers[file.uniqueIdentifier] = resolver;
    if (!busy) {
      processNextThumbail();
    }
  };

  return {
    'scope': false,
    'require': '^flowInit',
    'link': function(scope, element, attrs) {
      var file = attrs.flowImg;
      scope.$watch(file, function (file) {
        if (!file) {
          return ;
        }
        getThumbnailUrl(file, function (url) {
          if (!url) {
            return;
          }
          scope.$apply(function () {
            attrs.$set('src', url);
          });
        });
      });
    }
  };
}]);