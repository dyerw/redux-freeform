import test from "ava";
import { testProp, fc } from "ava-fast-check";

import { fieldNameGen, initializeReducer } from "./util";

import {
  createInitialState,
  createFormReducer,
  createMapDispatchToProps,
  createFormState,
  set,
  SET
} from "../src/main";
import {
  REQUIRED,
  REQUIRED_ERROR,
  MATCHES_FIELD,
  MATCHES_FIELD_ERROR
} from "../src/validation";

const formConfig = {
  foo: {
    validators: [
      {
        type: REQUIRED,
        args: [],
        error: REQUIRED_ERROR
      }
    ]
  }
};

testProp(
  "set creates returns an action creator that returns a valid action",
  [fieldNameGen(), fc.string()],
  (fieldName, fieldValue) => {
    const action = set(fieldName)(fieldValue);
    return (
      action.type === SET &&
      action.payload.value === fieldValue &&
      action.payload.fieldName === fieldName
    );
  }
);

test("createInitialState takes a formConfig and returns a valid formState", t => {
  const expectedFormState = {
    foo: {
      rawValue: "",
      validators: [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        }
      ],
      errors: [REQUIRED_ERROR],
      hasErrors: true,
      dirty: false
    }
  };
  t.deepEqual(createInitialState(formConfig), expectedFormState);
});

test("createFormReducer returns a valid form reducer", t => {
  const formReducer = createFormReducer(formConfig);
  const expectedInitialState = {
    foo: {
      rawValue: "",
      validators: [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        }
      ],
      errors: [REQUIRED_ERROR],
      hasErrors: true,
      dirty: false
    }
  };
  t.deepEqual(initializeReducer(formReducer), expectedInitialState);
});

test("reducer set action updates correct field", t => {
  const formReducer = createFormReducer(formConfig);
  const initialState = initializeReducer(formReducer);
  const expectedState = {
    foo: {
      rawValue: "bar",
      validators: [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        }
      ],
      errors: [],
      hasErrors: false,
      dirty: true
    }
  };
  t.deepEqual(
    formReducer(initialState, {
      type: SET,
      payload: { fieldName: "foo", value: "bar" }
    }),
    expectedState
  );
});

test("reducer set action re-validates dependent field", t => {
  const extendedFormConfig = {
    ...formConfig,
    matchesFoo: {
      validators: [
        {
          type: MATCHES_FIELD,
          args: ["foo"],
          error: MATCHES_FIELD_ERROR
        }
      ]
    }
  };
  const formReducer = createFormReducer(extendedFormConfig);
  const initialState = initializeReducer(formReducer);
  const expectedInitialState = {
    foo: {
      rawValue: "",
      validators: [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        }
      ],
      errors: [REQUIRED_ERROR],
      hasErrors: true,
      dirty: false
    },
    matchesFoo: {
      rawValue: "",
      validators: [
        {
          type: MATCHES_FIELD,
          args: ["foo"],
          error: MATCHES_FIELD_ERROR
        }
      ],
      errors: [],
      hasErrors: false,
      dirty: false
    }
  };
  t.deepEqual(expectedInitialState, initialState);
  const expectedState = {
    foo: {
      rawValue: "bar",
      validators: [
        {
          type: REQUIRED,
          args: [],
          error: REQUIRED_ERROR
        }
      ],
      errors: [],
      hasErrors: false,
      dirty: true
    },
    matchesFoo: {
      rawValue: "",
      validators: [
        {
          type: MATCHES_FIELD,
          args: ["foo"],
          error: MATCHES_FIELD_ERROR
        }
      ],
      errors: [MATCHES_FIELD_ERROR],
      hasErrors: true,
      dirty: false
    }
  };
  t.deepEqual(
    expectedState,
    formReducer(initialState, {
      type: SET,
      payload: { fieldName: "foo", value: "bar" }
    })
  );
});
