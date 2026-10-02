// PART B: Problems 1 to 5
// Run with:  node solutions.js
// Problem 1: Deep Equal
// Idea is to compare two objects without JSON.stringify.
//  1. If both values are identical primitives, they are equal.
//  2. If either one is not an object (or is null), they are not equal.
//  3. Both are objects: they must have the same number of keys, and every key in A must exist in B with a deeply equal value.
// The "deeply equal" check calls the same function again (recursion).
function deepEqual(objA, objB) {
  // Same value or same reference: equal
  if (objA === objB) return true;  // identical values? equal, done

  // If either is not an object, or is null, they can't be equal here
  if (
    typeof objA !== 'object' || objA === null ||
    typeof objB !== 'object' || objB === null
  ) {
    return false;  // one isn't an object: not equal
  }

  const keysA = Object.keys(objA);  // list of keys, e.g. ['a', 'b']
  const keysB = Object.keys(objB);

  // Different number of keys: not equal
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    // Key must exist in B AND the values must be deeply equal
    if (!Object.hasOwn(objB, key) || !deepEqual(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}

console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 2 } })); // true
console.log(deepEqual({ a: 1, b: { c: 2 } }, { a: 1, b: { c: 3 } })); // false
console.log(deepEqual({ a: 1 }, { a: 1, b: 2 }));                     // false


// Problem 2: Object Diff
// Idea is to compare only the top-level keys of the old and new object.
//  - added:   keys that exist only in newObj
//  - removed: keys that exist only in oldObj
//  - changed: keys in both whose values differ -> { from, to }
// A Set of all keys from both objects lets us check each key once.
function diffObjects(oldObj, newObj) {
  const result = { added: {}, removed: {}, changed: {} };

  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of allKeys) {
    const inOld = Object.hasOwn(oldObj, key); // is the key in the old object?
    const inNew = Object.hasOwn(newObj, key); // is the key in the new object?

    if (!inOld && inNew) {
      result.added[key] = newObj[key];  // only in new: it was added
    } else if (inOld && !inNew) {
      result.removed[key] = oldObj[key]; // only in old: it was removed
    } else if (oldObj[key] !== newObj[key]) {
      result.changed[key] = { from: oldObj[key], to: newObj[key] };
    }
  }
  return result;
}

console.log(
  diffObjects(
    { name: 'Setemi', role: 'Engineer', country: 'Jamaica' },
    { name: 'Setemi', role: 'Senior Engineer', city: 'Kingston' }
  )
);
// { added: { city: 'Kingston' },
//   removed: { country: 'Jamaica' },
//   changed: { role: { from: 'Engineer', to: 'Senior Engineer' } } }


// Problem 3: Deep Freeze
// Idea is to Object.freeze only locks the top level. So we freeze the object, then loop through its values, and for every value that is itself an object we call deepFreeze again (recursion).
function deepFreeze(obj) {
  Object.freeze(obj);  // lock the top level

  for (const value of Object.values(obj)) { // look at each value inside
    // Only freeze real objects (typeof null is also 'object', so check it)
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return obj;
}

const config = deepFreeze({ api: { baseUrl: 'https://x.com', retries: 3 }, debug: false });
config.api.baseUrl = 'https://changed.com'; // ignored (frozen)
config.debug = true;                        // ignored (frozen)
console.log(config.api.baseUrl, config.debug); // "https://x.com" false
console.log(Object.isFrozen(config.api));      // true


// Problem 4: Private Counter Factory (Easy)
// Idea is a closure. "count" is a variable inside createCounter, so nothing outside can touch it directly. 
// The returned object's methods can still reach it, because they were created inside the same function. 
// "value" is a getter, so counter.value reads the count like a property but cannot be set from outside.
function createCounter() {
  let count = 0; // private: nothing outside can reach this

  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    get value() {
      return count;
    },
  };
}

const counter = createCounter();
counter.increment();
counter.increment();
counter.decrement();
console.log(counter.value); // 1
console.log(counter.count); // undefined - not directly accessible


// Problem 5: Schema Validator
// Idea is to loop over every [key, expectedType] pair in the schema.
//  - If the key is missing in obj -> "key: missing property"
//  - If typeof the value is not the expected type ->
//    "key: expected X, got Y" Collect all messages in an errors array. Empty array = valid.
function validateSchema(obj, schema) {
  const errors = [];

  for (const [key, expectedType] of Object.entries(schema)) {
    if (!Object.hasOwn(obj, key)) {
      errors.push(`${key}: missing property`);
    } else if (typeof obj[key] !== expectedType) {
      errors.push(`${key}: expected ${expectedType}, got ${typeof obj[key]}`);
    }
  }

  return errors;
}

const schema = { name: 'string', age: 'number', isAdmin: 'boolean' };
console.log(validateSchema({ name: 'Ada', age: 21, isAdmin: false }, schema));
// []
console.log(validateSchema({ name: 'Ada', age: '21' }, schema));
// ['age: expected number, got string', 'isAdmin: missing property']
