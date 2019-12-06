---
id: validators-api
title: Validators
sidebar_label: Validators
---

## required

required validates on anything other than an empty string

```jsx
import { required } from "redux-freeform";

const formConfig = {
  email: {
    validators: [required()]
  }
};
```

| Value | Validates |
| ----- | --------- |
| ""    | False     |
| "foo" | True      |

## onlyIntegers

onlyIntegers will validate only on fields containing integers

```jsx
import { onlyIntegers } from "redux-freeform";

const formConfig = {
  age: {
    validators: [onlyIntegers()]
  }
};
```

| Value   | Validates |
| ------- | --------- |
| ""      | True      |
| "123"   | True      |
| "asdf"  | False     |
| "as123" | False     |

## numberLessThan

numberLessThan will validate any number less than the one provided

```jsx
import { numberLessThan } from "redux-freeform";

const formConfig = {
  age: {
    validators: [numberLessThan(11)]
  }
};
```

Arguments:
`numberLessThan(n)`

- `n` value must be numerically `<` than _n_

| Value | n   | Validates |
| ----- | --- | --------- |
| ""    | any | True      |
| "10"  | 11  | True      |
| "15"  | 11  | False     |

## hasLength

hasLength will validate for any string of the given length

```jsx
import { hasLength } from "redux-freeform";

const formConfig = {
  code: {
    validators: [hasLength(4, 6)]
  }
};
```

Arguments:
`hasLength(min, max)`

- `min` value must be >= _min_
- `max` value must be <= _max_

you can specify exactly one length like so:

`hasLength(4, 4)`

| Value    | min | max | Validates |
| -------- | --- | --- | --------- |
| ""       | 0   | 4   | True      |
| ""       | 1   | 4   | False     |
| "abc"    | 4   | 4   | False     |
| "abcd"   | 4   | 4   | True      |
| "abc"    | 2   | 4   | True      |
| "abcdef" | 1   | 3   | False     |

## matchesField

matchesField validates if this fields value is equivalent to another given fields value

```jsx
import { matchesField } from "redux-freeform";

const formConfig = {
  password: {
    validators: [hasLength(4, 6)]
  },
  confirmPassword: {
    validators: [matchesField("password")]
  }
};
```

Arguments:
`matchesField(fieldName)`

- `fieldName` the string name of another key in the form object

Note: this causes the field to essentially "inherit" the validators of the matching field, so you do not need to specify them on each one unless you want the errors to populate in both field states

| Value | Other Field Value | Validates |
| ----- | ----------------- | --------- |
| "foo" | "foo"             | True      |
| ""    | ""                | True      |
| "foo" | "bar"             | False     |

## matchesRegex

matchesRegex validates if this fields value is equivalent to the regex argument passed in the matchesRegex function

```jsx
import { matchesRegex } from "redux-freeform";

const formConfig = {
  email: {
    validators: [matchesRegex("^[^s@]+@[^s@]+.[^s@]+$")]
  }
};
```

Arguments:
`matchesRegex(regexValue)`

- `regexValue` the regex value must be a string, excluding the first and last slash `/`

| regexValue     | Value                 | Validates |
| -------------- | --------------------- | --------- |
| "^hey.\*joe\$" | "hey joe"             | True      |
| "^hey.\*joe\$" | "hey joe!"            | False     |
| "^hey.\*joe\$" | "hey how are you joe" | True      |

## isRoutingNumber

isRoutingNumber validates if this fields value is 9 digits long and has a valid checksum

```jsx
import { isRoutingNumber } from "redux-freeform";

const formConfig = {
  email: {
    validators: [isRoutingNumber()]
  }
};
```

Note: checksum based on http://www.brainjar.com/js/validation/ and assumes value
contains no letters or special characters

| Value       | Validates |
| ----------- | --------- |
| "122105155" | True      |
| "122105156" | False     |
| "000000000" | False     |