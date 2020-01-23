import test from "ava";
import { testProp, fc } from "ava-fast-check";

import { fieldNameGen } from "./util";
import {
  required,
  REQUIRED,
  REQUIRED_ERROR,
  onlyIntegers,
  ONLY_INTEGERS,
  ONLY_INTEGERS_ERROR,
  onlyNaturals,
  ONLY_NATURALS,
  ONLY_NATURALS_ERROR,
  numberLessThan,
  NUMBER_LESS_THAN,
  NUMBER_LESS_THAN_ERROR,
  matchesField,
  MATCHES_FIELD,
  MATCHES_FIELD_ERROR,
  hasLength,
  HAS_LENGTH,
  HAS_LENGTH_ERROR,
  validatorFns,
  runValidator,
  runValidatorErrorMessage,
  computeErrors,
  MATCHES_REGEX,
  MATCHES_REGEX_ERROR,
  matchesRegex,
  isRoutingNumber,
  IS_ROUTING_NUMBER,
  IS_ROUTING_NUMBER_ERROR,
  validateWhen,
  VALIDATE_WHEN,
  VALIDATE_WHEN_ERROR,
  validateWhenErrorMessage,
  numberGreaterThan,
  NUMBER_GREATER_THAN,
  NUMBER_GREATER_THAN_ERROR
} from "../src/validation";

test("required validator produces correct validator object", t => {
  t.is(required.error, REQUIRED_ERROR);
  t.deepEqual(required(), {
    type: REQUIRED,
    args: [],
    error: REQUIRED_ERROR
  });
});

test("onlyIntegers validator produces correct validator object", t => {
  t.is(onlyIntegers.error, ONLY_INTEGERS_ERROR);
  t.deepEqual(onlyIntegers(), {
    type: ONLY_INTEGERS,
    args: [],
    error: ONLY_INTEGERS_ERROR
  });
});

test("onlyNaturals validator produces correct validator object", t => {
  t.is(onlyNaturals.error, ONLY_NATURALS_ERROR);
  t.deepEqual(onlyNaturals(), {
    type: ONLY_NATURALS,
    args: [],
    error: ONLY_NATURALS_ERROR
  });
});

test("numberLessThan validator produces correct validator object", t => {
  t.is(numberLessThan.error, NUMBER_LESS_THAN_ERROR);
  t.deepEqual(numberLessThan(3), {
    type: NUMBER_LESS_THAN,
    args: [3],
    error: NUMBER_LESS_THAN_ERROR
  });
});

test("matchesField validator produces correct validator object", t => {
  t.is(matchesField.error, MATCHES_FIELD_ERROR);
  t.deepEqual(matchesField("foo"), {
    type: MATCHES_FIELD,
    args: ["foo"],
    error: MATCHES_FIELD_ERROR
  });
});

test("matchesRegex validator produces correct validator object", t => {
  t.is(matchesRegex.error, MATCHES_REGEX_ERROR);
  t.deepEqual(matchesRegex("^hey.*joe$"), {
    type: MATCHES_REGEX,
    args: ["^hey.*joe$"],
    error: MATCHES_REGEX_ERROR
  });
});

test("isRoutingNumber validator produces correct validator object", t => {
  t.is(isRoutingNumber.error, IS_ROUTING_NUMBER_ERROR);
  t.deepEqual(isRoutingNumber(), {
    type: IS_ROUTING_NUMBER,
    args: [],
    error: IS_ROUTING_NUMBER_ERROR
  });
});

test("numberGreaterThan validator produces correct validator object", t => {
  t.is(numberGreaterThan.error, NUMBER_GREATER_THAN_ERROR);
  t.deepEqual(numberGreaterThan("0"), {
    type: NUMBER_GREATER_THAN,
    args: ["0"],
    error: NUMBER_GREATER_THAN_ERROR
  });
});

test("validateWhen validator produces correct validator object", t => {
  t.is(validateWhen.error, VALIDATE_WHEN_ERROR);
  t.deepEqual(validateWhen(required(), required(), "foo"), {
    type: VALIDATE_WHEN,
    args: [
      {
        type: REQUIRED,
        args: [],
        error: REQUIRED_ERROR
      },
      {
        type: REQUIRED,
        args: [],
        error: REQUIRED_ERROR
      },
      "foo"
    ],
    // this is not a mistake, error key in validateWhen
    // object is the error key of the dependent validator
    error: REQUIRED_ERROR
  });
});

test("validateWhen validator accepts when precondition is met and dependentValidator validates", t => {
  const form = {
    a: {
      rawValue: "21"
    }
  };
  t.is(
    validatorFns[VALIDATE_WHEN](
      "foo",
      [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        },
        {
          type: NUMBER_GREATER_THAN,
          args: ["20"],
          error: NUMBER_GREATER_THAN_ERROR
        },
        "a"
      ],
      form
    ),
    true
  );
});

test("validateWhen validator rejects when precondition is met and dependentValidator doesn't validate", t => {
  const form = {
    a: {
      rawValue: "21"
    }
  };
  t.is(
    validatorFns[VALIDATE_WHEN](
      "",
      [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        },
        {
          type: NUMBER_GREATER_THAN,
          args: ["20"],
          error: NUMBER_GREATER_THAN_ERROR
        },
        "a"
      ],
      form
    ),
    false
  );
});

test("validateWhen validator accepts when precondition is met and dependentValidator validates without other field dep", t => {
  t.is(
    validatorFns[VALIDATE_WHEN](
      "6",
      [
        {
          type: NUMBER_GREATER_THAN,
          args: ["5"],
          error: NUMBER_GREATER_THAN_ERROR
        },
        {
          type: NUMBER_LESS_THAN,
          args: ["7"],
          error: NUMBER_GREATER_THAN_ERROR
        }
      ],
      {}
    ),
    true
  );
});

test("validateWhen validator rejects when precondition is met and dependentValidator validates without other field dep", t => {
  t.is(
    validatorFns[VALIDATE_WHEN](
      "4",
      [
        {
          type: NUMBER_GREATER_THAN,
          args: ["5"],
          error: NUMBER_GREATER_THAN_ERROR
        },
        {
          type: NUMBER_LESS_THAN,
          args: ["7"],
          error: NUMBER_GREATER_THAN_ERROR
        }
      ],
      {}
    ),
    false
  );
});

test("validateWhen validator accepts when precondition is not met", t => {
  const form = {
    a: {
      rawValue: "20"
    }
  };
  t.is(
    validatorFns[VALIDATE_WHEN](
      "foo",
      [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        },
        {
          type: NUMBER_GREATER_THAN,
          args: ["20"],
          error: NUMBER_GREATER_THAN_ERROR
        },
        "a"
      ],
      form
    ),
    true
  );
});

test("validateWhen validator accepts when precondition is not met and dependentValidator validates without other field dep", t => {
  const form = {
    a: {
      rawValue: "21"
    }
  };
  t.is(
    validatorFns[VALIDATE_WHEN](
      "20",
      [
        {
          type: NUMBER_LESS_THAN,
          args: ["20"],
          error: NUMBER_LESS_THAN_ERROR
        },
        {
          type: NUMBER_GREATER_THAN,
          args: ["20"],
          error: NUMBER_GREATER_THAN_ERROR
        }
      ],
      form
    ),
    true
  );
});

test("validateWhen error message formats properly", t => {
  const expected = `foo was passed to validateWhen, but that validator type does not exist.
  Please check that you are only calling validator creator functions exported from
  redux-freeform in your form config and that you didn't forget to
  invoke the validator creator (you cannot pass the functions themselves to
  createFormState). Also make sure you aren't passing validateWhen() to validateWhen
  as the primary validator.`;
  t.is(validateWhenErrorMessage("foo"), expected);
});

test("validateWhen throws error when dependent field does not exist", t => {
  const validatorError = t.throws(() =>
    runValidator(
      {
        type: VALIDATE_WHEN,
        args: [
          {
            type: REQUIRED,
            args: [],
            error: REQUIRED_ERROR
          },
          {
            type: REQUIRED,
            args: [],
            error: REQUIRED_ERROR
          },
          "foo"
        ],
        error: REQUIRED_ERROR
      },
      "bar",
      {}
    )
  );
  const expected = Error(
    "foo was passed to matchesField, but that field does not exist in the form"
  );
  t.deepEqual(validatorError, expected);
});

test("validateWhen throws error when dependent validator doesn't exist", t => {
  const validatorError = t.throws(() =>
    runValidator(
      {
        type: VALIDATE_WHEN,
        args: [
          {
            type: REQUIRED,
            args: [],
            error: REQUIRED_ERROR
          },
          {
            type: "NOT REAL VALIDATOR",
            args: [],
            error: REQUIRED_ERROR
          },
          "foo"
        ],
        error: REQUIRED_ERROR
      },
      "bar",
      {
        foo: {
          rawValue: "bar"
        }
      }
    )
  );
  const expected = Error(
    `NOT REAL VALIDATOR was passed to validateWhen, but that validator type does not exist.
  Please check that you are only calling validator creator functions exported from
  redux-freeform in your form config and that you didn't forget to
  invoke the validator creator (you cannot pass the functions themselves to
  createFormState). Also make sure you aren't passing validateWhen() to validateWhen
  as the primary validator.`
  );
  t.deepEqual(validatorError, expected);
});

testProp(
  "required validator accepts any string",
  [fc.string(1, 100)],
  stringA => !!validatorFns[REQUIRED](stringA, [], {})
);

test("required validator rejects empty string", t => {
  t.false(validatorFns[REQUIRED]("", [], {}));
});

testProp(
  "onlyIntegers validator accepts any integer string",
  [fc.integer()],
  intA => !!validatorFns[ONLY_INTEGERS](String(intA), [], {})
);

testProp(
  "onlyIntegers rejects alphabetic string",
  [fc.stringOf(fc.char().filter(c => /[A-z]/.test(c))).filter(s => s !== "")],
  stringA => !validatorFns[ONLY_INTEGERS](stringA, [], {})
);

testProp(
  "onlyIntegers rejects float string",
  [fc.float(), fc.integer(1, 10)],
  (floatA, fixedLength) =>
    !validatorFns[ONLY_INTEGERS](floatA.toFixed(fixedLength), [], {})
);

test("onlyIntegers accepts empty string", t => {
  t.true(validatorFns[ONLY_INTEGERS]("", [], {}));
});

testProp(
  "onlyNaturals validator accepts any natural string",
  [fc.nat()],
  natA => !!validatorFns[ONLY_NATURALS](String(natA), [], {})
);

testProp(
  "onlyNaturals rejects alphabetic string",
  [fc.stringOf(fc.char().filter(c => /[A-z]/.test(c))).filter(s => s !== "")],
  stringA => !validatorFns[ONLY_NATURALS](stringA, [], {})
);

testProp(
  "onlyNaturals rejects float string",
  [fc.float(), fc.integer(1, 10)],
  (floatA, fixedLength) =>
    !validatorFns[ONLY_NATURALS](floatA.toFixed(fixedLength), [], {})
);

testProp(
  "onlyNaturals rejects negative integers string",
  [fc.integer(-1)],
  negativeInt => !validatorFns[ONLY_NATURALS](negativeInt, [], {})
);

test("onlyNaturals accepts empty string", t => {
  t.true(validatorFns[ONLY_NATURALS]("", [], {}));
});

const smallerBiggerTuple = fc.float().chain(smallerNumber =>
  fc.tuple(
    fc.constant(smallerNumber),
    fc
      .float(smallerNumber, Number.MAX_SAFE_INTEGER)
      .filter(n => n !== smallerNumber)
  )
);

test("numberLessThan accepts empty string", t => {
  t.true(validatorFns[NUMBER_LESS_THAN]("", {}));
});

testProp(
  "numberLessThan accepts value less than argument",
  [smallerBiggerTuple],
  ([smallerNumber, biggerNumber]) =>
    !!validatorFns[NUMBER_LESS_THAN](String(smallerNumber), [biggerNumber], {})
);

testProp(
  "numberLessThan rejects value greater than argument",
  [smallerBiggerTuple],
  ([smallerNumber, biggerNumber]) =>
    !validatorFns[NUMBER_LESS_THAN](String(biggerNumber), [smallerNumber], {})
);

testProp(
  "numberLessThan rejects value equal to argument",
  [fc.float()],
  numberA => !validatorFns[NUMBER_LESS_THAN](String(numberA), [numberA], {})
);

test("numberGreaterThan accepts empty string", t => {
  t.true(validatorFns[NUMBER_GREATER_THAN]("", {}));
});

testProp(
  "numberGreaterThan accepts value less than argument",
  [smallerBiggerTuple],
  ([smallerNumber, biggerNumber]) =>
    !!validatorFns[NUMBER_GREATER_THAN](
      String(biggerNumber),
      [smallerNumber],
      {}
    )
);

testProp(
  "numberGreaterThan rejects value greater than argument",
  [smallerBiggerTuple],
  ([smallerNumber, biggerNumber]) =>
    !validatorFns[NUMBER_GREATER_THAN](
      String(smallerNumber),
      [biggerNumber],
      {}
    )
);

testProp(
  "numberGreaterThan rejects value equal to argument",
  [fc.float()],
  numberA => !validatorFns[NUMBER_GREATER_THAN](String(numberA), [numberA], {})
);

testProp(
  "matchesField accepts value equal to argument field rawValue",
  [fieldNameGen(), fc.string()],
  (fieldName, fieldValue) =>
    !!validatorFns[MATCHES_FIELD](fieldValue, [fieldName], {
      [fieldName]: {
        rawValue: fieldValue
      }
    })
);

testProp(
  "matchesField rejects value not equal to argument field rawValue",
  [
    fc.string(1, 15).filter(str => /^[A-Za-z]$/.test(str)),
    fc.string(1, 15).filter(str => /^[A-Za-z]$/.test(str)),
    fc.string(1, 15).filter(str => /^[A-Za-z]$/.test(str))
  ],
  (fieldName, fieldValue, fieldValueModifier) =>
    !validatorFns[MATCHES_FIELD](fieldValue, [fieldName], {
      [fieldName]: {
        rawValue: `${fieldValue}${fieldValueModifier}`
      }
    })
);

const testRegexStr = "^[^s@]+@[^s@]+.[^s@]+$";
testProp(
  "regex string passed to matchesRegex matches test result of vanilla JS regex when passing regex test",
  [fc.string(1, 15).filter(str => new RegExp(testRegexStr).test(str))],
  valueThatMatchesRegex =>
    validatorFns[MATCHES_REGEX](valueThatMatchesRegex, [testRegexStr], {})
);

testProp(
  "regex string passed to matchesRegex matches test result of vanilla JS regex when failing regex test",
  [fc.string(1, 15).filter(str => !new RegExp(testRegexStr).test(str))],
  valueThatDoesNotMatchRegex =>
    !validatorFns[MATCHES_REGEX](valueThatDoesNotMatchRegex, [testRegexStr], {})
);

test("matchesRegex accepts when value is empty string", t => {
  t.is(validatorFns[MATCHES_REGEX]("", ["doesntmatter"], {}), true);
});

test("matchesField throws an error when form does not include field", t => {
  const validatorError = t.throws(() =>
    runValidator(
      { type: MATCHES_FIELD, args: ["foo"], error: MATCHES_FIELD_ERROR },
      "bar",
      {}
    )
  );
  t.is(
    validatorError.message,
    "foo was passed to matchesField, but that field does not exist in the form"
  );
});

// based on http://www.brainjar.com/js/validation
const calcCheckSum = (n0, n1, n2, n3, n4, n5, n6, n7) =>
  (10 -
    ((n0 * 3 + n1 * 7 + n2 * 1 + n3 * 3 + n4 * 7 + n5 * 1 + n6 * 3 + n7 * 7) %
      10)) %
  10;

testProp(
  "isRoutingNumber validates numbers that satisfy routing checksum rules",
  [
    fc.integer(1, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9)
  ],
  (...first8Digits) => {
    const validRoutingNumber = `${first8Digits.join("")}${calcCheckSum(
      ...first8Digits
    )}`;
    return validatorFns[IS_ROUTING_NUMBER](validRoutingNumber, [], {});
  }
);

testProp(
  "isRoutingNumber does not validate when value is less than 9 digits",
  [
    fc.integer(1, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9),
    fc.integer(0, 9)
  ],
  (...first8Digits) => {
    const invalidRoutingNumber = first8Digits.join("");
    return !validatorFns[IS_ROUTING_NUMBER](invalidRoutingNumber, [], {});
  }
);

test("isRoutingNumber validated on empty string", t => {
  t.is(validatorFns[IS_ROUTING_NUMBER]("", [], {}), true);
});

test("runValidator returns null when validator accepts", t => {
  t.is(runValidator({ type: REQUIRED, args: [] }, "foo", {}), null);
});

test("runValidator returns validator error when validator rejects", t => {
  t.is(
    runValidator({ type: REQUIRED, args: [], error: REQUIRED_ERROR }, "", {}),
    REQUIRED_ERROR
  );
});

test("runValidator throws error when validatorFn does not exist", t => {
  const validatorError = t.throws(() =>
    runValidator({ type: "foo", args: [], error: "bar" }, "", {})
  );
  t.is(validatorError.message, runValidatorErrorMessage("foo"));
});

test("computeErrors returns an empty array when validators accept", t => {
  const acceptingForm = {
    foo: {
      rawValue: "12",
      validators: [
        { type: REQUIRED, args: [], error: REQUIRED_ERROR },
        { type: ONLY_INTEGERS, args: [], error: ONLY_INTEGERS_ERROR },
        { type: NUMBER_LESS_THAN, args: [13], error: NUMBER_LESS_THAN_ERROR }
      ]
    }
  };
  t.deepEqual(computeErrors("foo", acceptingForm), []);
});

test("computeErrors returns an array of errors for each rejecting validator", t => {
  const rejectingForm = {
    foo: {
      rawValue: "11",
      validators: [
        { type: REQUIRED, args: [], error: REQUIRED_ERROR },
        { type: MATCHES_FIELD, args: ["bar"], error: MATCHES_FIELD_ERROR },
        { type: ONLY_INTEGERS, args: [], error: ONLY_INTEGERS_ERROR },
        { type: NUMBER_LESS_THAN, args: [10], error: NUMBER_LESS_THAN_ERROR }
      ]
    },
    bar: {
      rawValue: "12",
      validators: []
    }
  };
  t.deepEqual(computeErrors("foo", rejectingForm), [
    MATCHES_FIELD_ERROR,
    NUMBER_LESS_THAN_ERROR
  ]);
});

test("hasLength validator creates valid validator object", t => {
  t.is(hasLength.error, HAS_LENGTH_ERROR);
  t.deepEqual(hasLength(1, 10), {
    type: HAS_LENGTH,
    args: [1, 10],
    error: HAS_LENGTH_ERROR
  });
});

//TODO: Make prop test
test("hasLength validator returns null when validator accepts", t => {
  t.is(
    runValidator(
      { type: HAS_LENGTH, args: [1, 10], error: HAS_LENGTH_ERROR },
      "123",
      {}
    ),
    null
  );
});

test("hasLength validator accepts when value is empty string", t => {
  t.is(validatorFns[HAS_LENGTH]("", [1, 10], {}), true);
});

//TODO: Make prop test
test("hasLength validator returns error when validator rejects", t => {
  t.is(
    runValidator(
      { type: HAS_LENGTH, args: [1, 3], error: HAS_LENGTH_ERROR },
      "1234",
      {}
    ),
    HAS_LENGTH_ERROR
  );
});

test("hasLength throws error when max or min are not passed", t => {
  const validatorError = t.throws(() =>
    runValidator(
      { type: HAS_LENGTH, args: [1], error: HAS_LENGTH_ERROR },
      "9",
      {}
    )
  );
  t.is(
    validatorError.message,
    "Max and min need to be defined for hasLength, both or one of them is undefined"
  );
  const validatorError2 = t.throws(() =>
    runValidator(
      { type: HAS_LENGTH, args: [], error: HAS_LENGTH_ERROR },
      "9",
      {}
    )
  );
  t.is(
    validatorError2.message,
    "Max and min need to be defined for hasLength, both or one of them is undefined"
  );
});

test("hasLength throws error when max is less than min", t => {
  const validatorError = t.throws(() =>
    runValidator(
      { type: HAS_LENGTH, args: [10, 1], error: HAS_LENGTH_ERROR },
      "9",
      {}
    )
  );
  t.is(
    validatorError.message,
    "hasLength validator was passed a min greater than the max"
  );
});
