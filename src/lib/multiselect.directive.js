(function() {
    'use strict';

    angular
        .module('amo.multiselect')
        .directive('amoMultiselect', MultiselectDirective);

    /**
     * @ngdoc directive
     * @module amo.multiselect
     * @name amoMultiselect
     * @requires $compile
     * @requires $parse
     * @requires $timeout
     * @requires AmoMultiselectFactory
     * @requires amoMultiselectFormatService
     */
    function MultiselectDirective($compile, $parse, $timeout, AmoMultiselectFactory, amoMultiselectFormatService) {

        return {
            link: link,
            replace: true,
            restrict: 'E',
            require: 'ngModel'
        };

        /**
         * @name amoMultiselect#link
         * @description Directive's link function
         * @param {Object} parentScope Angular scope object
         * @param {Object} element jQuery object
         * @param {Object} attrs Hash object of attribute names and values
         * @param {Object} ngModelController
         */
        function link(parentScope, element, attrs, ngModelController) {

            var _exposeLabel = attrs.label ? $parse(attrs.label) : angular.noop,
                _isInternalChange,
                _labels = [],
                _onChange = attrs.onChange ? $parse(attrs.onChange) : angular.noop,
                _onToggleDropdown = attrs.onToggleDropdown ? $parse(attrs.onToggleDropdown) : angular.noop,
                _selectedOptions = [];

            var multiselect = new AmoMultiselectFactory(attrs.options, parentScope),
                scope = parentScope.$new(),
                self = {};

            scope.multiselectDropdown = self;

            // Variables
            self.options = [];
            self.search = {};
            self.text = {
                deselectAll: attrs.deselectAllText || 'Deselect All',
                search: attrs.searchText || 'Search...',
                selectAll: attrs.selectAllText || 'Select All',
            };

            // Methods
            self.getSelectedCount = getSelectedCount;
            self.exposeSelectedOptions = exposeSelectedOptions;
            self.hasSelectedMultipleItems = hasSelectedMultipleItems;
            self.onToggleDropdown = onToggleDropdown;

            // Initialization
            initialize();

            /**
             * @ngdoc method
             * @name amoMultiselect#addLabel
             * @description Adds the formatted label for the specified option
             * @param {*} option
             */
            function addLabel(option) {
                _labels.push(multiselect.getLabel(option));
            }

            /**
             * @name amoMultiselect#exposeOptions
             * @description Exposes the multiselect options
             */
            function exposeOptions() {
                var i,
                    selected,
                    value;

                _labels.length = 0;
                self.options.length = 0;

                // Iterate through original options and create exposed model
                multiselect.getOptions().forEach(function(option, index) {
                    selected = false;
                    value = multiselect.getValue(option);

                    for (i = 0; i < _selectedOptions.length; i++) {
                        if (angular.equals(_selectedOptions[i], value)) {
                            selected = true;
                            addLabel(option);
                            break;
                        }
                    }

                    self.options.push({
                        id: index,
                        label: multiselect.getLabel(option),
                        value: value,
                        selected: selected
                    });
                });

                setSelectedLabel();
            }

            /**
             * @ngdoc method
             * @name amoMultiselect#exposeSelectedOptions
             * @description Exposes the selected options
             */
            function exposeSelectedOptions() {
                var option;

                _labels.length = 0;
                _selectedOptions.length = 0;

                self.options.forEach(function(optionModel, index) {
                    if (!optionModel.selected) { return; }

                    option = multiselect.getOption(index);

                    addLabel(option);

                    _selectedOptions.push(multiselect.getValue(option));
                });

                _isInternalChange = true; // Prevent unnecessary $watch logic

                ngModelController.$setViewValue(_selectedOptions);

                _onChange(scope, {
                    label: setSelectedLabel()
                });
            }

            /**
             * @ngdoc method
             * @name amoMultiselect#initialize
             * @description Returns the count of selected options
             * @returns {Number}
             */
            function getSelectedCount() {
                return _selectedOptions.length;
            }

            /**
             * @ngdoc method
             * @name amoMultiselect#hasSelectedMultipleItems
             * @description Determines whether or not multiple items are selected
             * @returns {Boolean}
             */
            function hasSelectedMultipleItems() {
                return getSelectedCount() > 1;
            }

            /**
             * @name amoMultiselect#initialize
             * @description Initializes the directive
             */
            function initialize() {
                element.append($compile('<amo-multiselect-dropdown></amo-multiselect-dropdown>')(scope));

                parentScope.$on('$destroy', function() {
                    scope.$destroy();
                });

                // Watch for option array changes
                parentScope.$watch(multiselect.getOptionsExpression(), function(options) {
                    multiselect.setOptions(options);
                    exposeOptions();
                }, true);
                
                // Watch for (external) model changes
                parentScope.$watch(function() {
                    return ngModelController.$modelValue;
                }, function(modelValue) {
                    // TODO: Determine if there is a better way to do this
                    if (_isInternalChange) {
                        _isInternalChange = false;
                        return;
                    }

                    if (angular.isArray(modelValue)) {
                        _selectedOptions = modelValue;
                    }

                    exposeOptions();
                }, true);
            }

            /**
             * @ngdoc method
             * @name amoMultiselect#onToggleDropdown
             * @description Handler executed when dropdown opens or closes
             */
            function onToggleDropdown(isOpen) {
                if (!isOpen) {
                    $timeout(function() {
                        self.search = {};
                    });
                }

                _onToggleDropdown(scope, {
                    isOpen: isOpen
                });
            }

            /**
             * @name amoMultiselect#setSelectedLabel
             * @description Sets the selected label
             * @returns {String} New label
             */
            function setSelectedLabel() {
                var label = attrs.selectText || 'Select...';

                if (_labels.length > 0) {
                    if (angular.isDefined(_labels[0])) { // Support undefined labels
                        label = amoMultiselectFormatService.joinLabels(_labels);
                    } else {
                        label = amoMultiselectFormatService.pluralize(_labels, attrs.selectedSuffixText, attrs.selectedSuffixSingularText || attrs.selectedSuffixText);
                    }
                }

                self.selectedLabel = label;

                if (angular.isFunction(_exposeLabel.assign)) {
                    _exposeLabel.assign(parentScope, label);
                }

                return label;
            }
        }
    }

})();
