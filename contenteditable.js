'use strict'
/*
 * https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
 */
angular.module('angularjs-editor', ['ngRoute', 'angular-smilies'])
        .directive('contenteditable', ['$sce', '$filter', function ($sce, $filter) {
                return {
                    restrict: 'A', // only activate on element attribute
                    require: '?ngModel', // get a hold of NgModelController
                    link: function (scope, element, attrs, ngModel) {
                        if (!ngModel)
                            return; // do nothing if no ng-model
                        /*
                         *  // read from input and write data to the model 
                         * @param {type} event
                         * @param {type} callback
                         * @returns {undefined}
                         */
                       
                        var read = function (event, callback) {
                            var html = element.html();
                             Utils.debug_log(html, "Angilar egitor read function html bofore strip br");
                            if (attrs.stripBr && html!=='') {
                                html = html.replace(/<br>$/, '&nbsp;');
                            }
                            Utils.debug_log(html, "Angilar egitor read function html after strip br");
                            if (event && event.keyCode == 32) {
                                html = $filter('smilies')(html);
                                ngModel.$setViewValue(html);
                                element.html(html)
                                if (callback && (typeof callback) == 'function')
                                    callback();
                            } else {
                                ngModel.$setViewValue(html);
                            }
                        }

                        var moveCaretToEndOnChange = function () {
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
                        /*
                         * Specify how UI should be updated
                         */
                        ngModel.$render = function () {
                            Utils.debug_log(ngModel.$viewValue, "Render element function");
                            var value = null;
                            if (attrs.focusOnChange && ngModel.$viewValue!=='') {
                                value = $filter('smilies')(ngModel.$viewValue)+'&nbsp';
                                ngModel.$setViewValue(value)
                                element.html(value);
                            } else {
                                element.html(ngModel.$viewValue);
                            }
                        };

                        element.on('keyup change', function (event) {
                            scope.$evalAsync(read(event, moveCaretToEndOnChange));
                        });
                        element.on('blur', function (event) {
                            scope.$evalAsync(read(event, null));

                        });
                        element.on('focus', function (event) {
                            moveCaretToEndOnChange();
                        })
                        read(null, null);
                    }
                };
            }]);

