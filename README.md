# AngularJS Multiselect [![Build Status](https://travis-ci.org/namoscato/angular-multiselect.svg?branch=master)](https://travis-ci.org/namoscato/angular-multiselect)

AngularJS multiselect component based off [`ngOptions`](https://docs.angularjs.org/api/ng/directive/ngOptions).

## Dependencies

* [AngularJS](https://angularjs.org/) v1.5.0
* [Bootstrap](http://getbootstrap.com/) v3.3.6 for dropdown styles
* [UI Bootstrap](http://angular-ui.github.io/bootstrap/) v1.1.2 for dropdown functionality

_Note that [`backport`](https://github.com/namoscato/angular-multiselect/tree/backport) supports older versions of these dependencies._

## Development

1. Install dependencies

        npm install

2. Compile JavaScript & CSS

        gulp all

3. Run local webserver

        gulp serve

## Usage

The interface for this directive is based off [`ngOptions`](https://docs.angularjs.org/api/ng/directive/ngOptions):

```html
<amo-multiselect
    ng-model="app.model"
    options="option.id as option.label for option in app.options"
    on-change="app.onChange(label)"
    on-toggle-dropdown="app.onToggleDropdown(isOpen)"
    label="app.label"
    search-text="Search..."
    select-text="Select..."
    select-all-text="Select All"
    deselect-all-text="Deselect All"
    selected-suffix-singular-text="thing"
    selected-suffix-text="things">
</amo-multiselect>
```

where the value of `options` is of the following form: `[`_`select`_ **`as`**`]` _`label`_ **`for`** _`value`_ **`in`** _`array`_

## Running Tests

Install the [Karma](http://karma-runner.github.io/) commandline interface (`karma-cli`) globally and run:

    karma start
