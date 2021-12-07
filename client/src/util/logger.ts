// import path from 'path'
import debug, { IDebugger } from 'debug'
/

// disable if in production
if (process.env && process.env.NODE_ENV === 'development') {
  debug.enable('monrepondeurauto:*')
} else {
  debug.disable()
}

interface ILogger {
  log: IDebugger
  error: IDebugger
}

export default (target: any): ILogger => {
  const echo = () => {

    return ''
  }
  const logger = {
    error: debug(`monrepondeurauto:${target}${echo()}`),
    log: debug(`monrepondeurauto:${target}${echo()}`)
    // emitter: ErrorPlugin.emitter
  }

  // tslint:disable-next-line no-console
  logger.log.log = console.log.bind(console)
  logger.error.log = console.error.bind(console)

  return logger
}



