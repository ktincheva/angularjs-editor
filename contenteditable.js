'use strict'
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
                            var html = element.html();
                            if (html != '') {
                                if (attrs.stripBr == "true" && event && event.keyCode == 32) {
                                    html = html.replace(/<br\s*[\/]?>/gi, "&nbsp;");
                                }
                                if (event && event.keyCode == 32) {
                                    // Hach smilies filter skip filterin OO
                                    html = html.replace("ОО", "О^О");
                                    html = $filter('smilies')(html);
                                    html = html.replace("О^О", "ОО");
                                }
                                updateView(html);
                            }
                        }
                        var updateView = function (html) {
                            if (ngModel.$viewValue != html)
                            {
                                ngModel.$setViewValue(html);
                                ngModel.$render();
                            }
                        }
                        var moveCaretToEndOnChange = function () {
                            var contentEditableElement = element[0];
                            //  console.trace("move caret of end of changes");
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
                            if (element.html() != ngModel.$viewValue)
                            {
                                element.html(ngModel.$viewValue);
                                moveCaretToEndOnChange();
                            }
                        };

                        element.on('keyup change', function (event) {
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
                            scope.$evalAsync(read(event, null));
                        });
                        element.on('focus', function (event) {
                            scope.$evalAsync(read(event, null));
                        })
                        // read(null, null);
                    }
                };
            }]);