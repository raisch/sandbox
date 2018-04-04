
// run:
//  node resultOf.js

/**
 * @typedef {Array} AsyncResult
 * @property {String|null} 1 - error upon failure
 * @property {*} 2 - result upon success
 *
 * @example
 *  // on success
 *  [null, { result: { of: { async: { operation: true } } } } ] // on success
 *  ['error message', undefined] // on failure
 */

/**
 * Standardizes async / await return values and removes the need for try/catch.
 * Inspired by error handling in elixir.
 *
 * @param  {Promise} - promised func invocation
 * @return {Promise.<AsyncResult>}
 *
 * @example
 *
 *   async func() {
 *    let [err, res] = await resultOf(asyncFunction())
 *   }
 */
const resultOf = (promise) => {
  return promise
    .then(data => {
      return [null, data]
    }).catch(err => {
      return [err, null] // null added for illustrative purposes
    })
}

/**
 * Waits a bit and fails via Promise.reject().
 *
 * @return {Promise}
 */
const expectFailAsync = () => {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => reject('expectFailAsync ran out of time'),
      1000
    )
  })
}

// Old way

const usingTryCatch = async () => {
  let res
  try {
    res = await expectFailAsync()
  }
  catch (err) {
    console.error(`OLD usingTryCatch Error: ${err}`)
    return
  }
}

usingTryCatch()

// new way

const usingResultOf = async (...args) => {
  let [err, res] = await resultOf(expectFailAsync(args))
  console.log(`NEW usingResultOf: ${JSON.stringify([err, res])}`)
}

usingResultOf()

const usingThenCatch = async (...args) => {
  const result = await expectFailAsync(args)
    .then(res => console.log(`ALT usingThenCatch:${JSON.stringify({res})}`))
    .catch(err => console.log(`ALT usingThenCatch: ${JSON.stringify({err})}`)) // unneeded since all results are [err, res]
}

usingThenCatch()

/* prints to console:

  OLD usingTryCatch Error: expectFailAsync ran out of time
  ALT usingThenCatch: {"err":"expectFailAsync ran out of time"}
  NEW usingResultOf: ["expectFailAsync ran out of time",null]

 */
