use strict'
/*
 * https://docs.angularjs.org/api/ng/type/ngModel.NgModelController
 */
angular.module('angularjs-editor', ['ngRoute', 'angular-smilies'])
        .service('Selection', ['$document', function ($document) {
                var selection = {
                    getSelection: function () {

                    }
                }
            }])
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

                        var range, selection, start, end, selectedText, startNode, endNode;

                        var read = function (event, callback) {
                            var html = element.html().trim();
                            if (html != '') {

                                if (attrs.stripBr && event && event.keyCode == 32) {
                                    html = html.replace(/<br\s*\/?>/gi, '');
                                }
                                html = $filter('smilies')(html);
                                updateView(html);
                            }
                        }
                        var updateView = function (html) {
                            console.log('Update view function html', html);
                            if (ngModel.$viewValue != html)
                            {
                                ngModel.$setViewValue(html);
                                element.html(html);
                                if (element[0].lastChild.nodeName == 'I') element.html(element.html().trim()+"&nbsp;");
                                moveCaretToEndOnChange()
                            }
                        }
                        var moveCaretToEndOnChange = function () {
                            var contentEditableElement = element[0];
                            var range, selection;
                            if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
                            {
                                range = document.createRange();//Create a range (a range is a like the selection but invisible)
                                range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
                                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                                selection = window.getSelection();//get the selection object (allows you to change selection)
                                selection.removeAllRanges();//remove any selections already made
                                selection.addRange(range);//make the range you have just created the visible selection
                            }
                            else if (document.selection)//IE 8 and lower
                            {
                                range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
                                range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
                                range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
                                range.select();//Select the range (make it the visible selection
                            }
                        }



                        /*
                         * Specify how UI should be updated
                         */
                        ngModel.$render = function () {
                            var value = null;
                            console.log("Render started ngModel", ngModel.$viewValue);

                            if (attrs.focusOnChange && ngModel.$viewValue !== '') {
                                value = $filter('smilies')(ngModel.$viewValue);
                                element.html(value);
                                if (element[0].lastChild.nodeName == 'I') element.html(element.html().trim()+"&nbsp;");
                                moveCaretToEndOnChange()
                            } else {
                                if (ngModel.$viewValue != '' && element.html() != ngModel.$viewValue)
                                    element.html(ngModel.$viewValue);

                            }
                        };

                        element.on('keyup change', function (event) {
                            console.log("On keyup and change function" + event.which);

                            if (event.which === 13 && !event.shiftKey && ngModel !== '' && attrs.sendOnEnter) {
                                if (scope[attrs.sendOnEnter] && (typeof scope[attrs.sendOnEnter] == 'function')) {
                                    scope[attrs.sendOnEnter]();
                                }
                                ngModel.$setViewValue('')
                            } else {
                                scope.$evalAsync(read(event, null));
                            }
                        });
                        element.on('blur', function (event) {
                            console.log("On blur function: ", event.type);
                            scope.$evalAsync(read(event, null));

                        });
                        element.on('focus', function (event) {
                             console.log("On focus function: ", event.type);
                           scope.$evalAsync(read(event, null));
                        })
                        // read(null, null);
                    }
                };
            }]);