import { equals } from '../../equals.js';

let expectCount
resetExpectCount()

let specificationRunning = false
let specificationLabel = undefined
const specificationFunctionQueue = []

export async function specification(specificationLabelOrFunction, specificationFunction) {
  if (typeof specificationLabelOrFunction === 'function') {
    specificationLabel = undefined
    specificationFunction = specificationLabelOrFunction
  } else {
    specificationLabel = specificationLabelOrFunction
  }

  specificationFunctionQueue.push(specificationFunction)
  if (!specificationRunning) {
    await runSpecificationFunctions()
  }
}

async function runSpecificationFunctions() {
  specificationRunning = true
  let specificationFunction = specificationFunctionQueue.shift()
  while (specificationFunction) {
    await runSpecificationFunction(specificationFunction)
    specificationFunction = specificationFunctionQueue.shift()
  }
  specificationRunning = false
}

async function runSpecificationFunction(specificationFunction) {
  resetExpectCount()

  await specificationFunction()

  const expectCount = getExpectCount()
  if (expectCount === 0) {
    throw Error('specification has no expectation')
  } else if (expectCount > 1) {
    throw Error('specification has more than one expectation')
  } else if (specificationLabel) {
    console.log(`✓ ${specificationLabel}`)
  }
}

function getExpectCount() {
  return expectCount
}

function resetExpectCount() {
  expectCount = 0
}

function incrementExpectCount() {
  expectCount++
}

export function expect(what) {
  return {
    toEqual(whatElse) {
      incrementExpectCount()
      if (!(equals(what, whatElse))) {
        throw Error('what !== whatElse', what, whatElse)
      }
    },
    toHaveType(expectedType) {
      incrementExpectCount()
      if (!(what && what.constructor && what.constructor.name === expectedType.name)) {
        throw Error('has not the type "' + expectedType.name + '"')
      }
    },
    toThrowError(expectedErrorMessage) {
      incrementExpectCount()
      if (!throwsError(what, expectedErrorMessage)) {
        throw Error('Expected to throw error "' + expectedErrorMessage + '"')
      }
    },
    toExist() {
      incrementExpectCount()
      if (typeof what === 'undefined') {
        throw Error('No existance')
      }
    },
  }
}

export function throwsError(what, expectedErrorMessage) {
  try {
    what()
    return false
  } catch (error) {
    if (expectedErrorMessage) {
      if (error.message === expectedErrorMessage) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
}

process.on('unhandledRejection', function (reason) {
  console.error(reason)
  process.exit(1)
})

process.on('exit', function (exitCode) {
  if (exitCode === 0) {
    console.log('\x1b[32mSpecification passed.\x1b[0m')
  }
})