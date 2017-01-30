'use strict'
editor.directive('contenteditable', ['$sce', '$filter', function ($sce, $filter) {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function (scope, element, attrs, ngModel) {
                if (!ngModel)
                    return; // do nothing if no ng-model
                 var read = function(event, callback) {
                    var html = element.html();
                    
                    element.html('');
                    if (attrs.stripBr && html === '<br>') {
                        html = '';
                    }
                    
                    if (event && event.keyCode == 32) {
                        html = $filter('smilies')(html);
                    }
                    ngModel.$setViewValue(html);
                    element.html(html)
                    if(callback && (typeof callback) == 'function') callback();
                }

                var moveCaretToEndOnChange = function() {
                    var el = element[0]
                    var range = document.createRange()
                    var sel = window.getSelection()
                    if (el.childNodes.length > 0) {
                        var child = el.childNodes[el.childNodes.length - 1]
                        range.setStartAfter(child)
                    } else {
                        range.setStartAfter(el)
                    }
                    range.collapse(true)
                    sel.removeAllRanges()
                    sel.addRange(range)
                }
                // Specify how UI should be updated
                ngModel.$render = function () {
                    var value = null
                    if (attrs.focusOnChange) {
                        value = $filter('smilies')(ngModel.$viewValue+'&nbsp;')
                        ngModel.$setViewValue(value)
                        element.html($sce.getTrustedHtml(value || ''));
                        element.on('focus', function (event) {
                            moveCaretToEndOnChange();
                        })
                    } else {
                         element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                    }
                };

                // Listen for change events to enable binding
                element.on('keyup change', function (event) {
                    scope.$evalAsync(read(event, moveCaretToEndOnChange));
                });
               element.on('blur', function (event) {
                    scope.$evalAsync(read(event, null));
                });
                read(null, null); // initialize

                // Write data to the model
               
            }
        };
    }]);

