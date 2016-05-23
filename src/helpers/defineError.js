export default function defineError (name, defaultMessage) {
  let customError = new Function(
    `return function ${name} (msg) { this.message = msg || arguments.callee.message; this.name = "${name}"; Error.captureStackTrace(this, arguments.callee); }`
  )()

  customError.message = defaultMessage || name
  customError.prototype = Object.create(Error.prototype)
  customError.prototype.constructor = customError
  return customError
}
