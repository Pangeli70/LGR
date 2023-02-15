/** ---------------------------------------------------------------------------
 * @module [Lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.2.0 [APG 2018/06/02]
 * @version 0.5.1 [APG 2019/01/07]
 * @version 0.7.0 [APG 2019/08/15]
 * @version 0.7.1 [APG 2019/08/27]
 * @version 0.8.0 [APG 2022/03/12] Porting to Deno
 * @version 0.9.0 [APG 2022/08/09] Code smells and metrics
 * @version 0.9.1 [APG 2022/09/24] Github Beta
 * @version 0.9.2 [APG 2022/09/24] Enable / Disable
 * @version 0.9.5 [APG 2023/02/14] Rst simplification 
 * -----------------------------------------------------------------------------
*/

import { Rst, Uts } from "../../deps.ts";
import { ApgLgr } from './ApgLgr.ts';


/** 
 * Base class for inheritance or composition of objects that can log events
 */
export class ApgLgrLoggable extends Uts.ApgUtsMeta {

  /** Class name */
  readonly className: string;

  /** Stack for nested logBegin/logEnd methods */
  private _callsStack: string[] = [];

  /** Events logger */
  protected logger: ApgLgr;

  /** Constructor events logger */
  private _constructorLogger: ApgLgr;
  
  /** Logger enable/disable flag. Logging features are enabled by default */
  private _enabled = true;



  constructor(aclassName: string, alogger: ApgLgr) {
    super(import.meta.url);

    this.className = aclassName;

    Rst.ApgRstAssert.IsUndefined(
      alogger,
      'Logger undefined for constructor of class' + aclassName,
      true
    );

    this.logger = alogger;
    this._constructorLogger = alogger;

  }


  logEnable() {
    this._enabled = true;
  }


  logDisable() {
    Rst.ApgRstAssert.IsFalse(
      this.logger.depth == 0,
      "We can't disable the logging features before all the pending logEnd call have been called. The current depth is :" + this.logger.depth.toString(),
      true)
    this._enabled = false;
  }


  get #methodName() {
    return this._callsStack[this._callsStack.length - 1];
  }


  public logReplaceLogger(alogger: ApgLgr) {

    Rst.ApgRstAssert.IsUndefined(
      alogger,
      'Logger undefined for constructor of class' + this.className,
      true
    );

    this.logger = alogger;
  }


  public logRestoreConstructorLogger() {

    this.logger = this._constructorLogger;
  }


  public logBegin(amethodName: string, aresult?: Rst.IApgRst) {

    if (!this._enabled) return;

    const BEGIN = "{"

    this._callsStack.push(amethodName);
    this.logger.depth++;

    if (aresult) {
      const message = aresult.message ? BEGIN + " => " + aresult.message : BEGIN
      aresult.message = message;
      this.#logResult(aresult);
    }
    else {
      this.logTrace(BEGIN);
    }
  }


  logBeginUsing(
    alogger: ApgLgr,
    amethodName: string,
    aresult?: Rst.IApgRst
  ) {
    if (!this._enabled) return;
    this.logReplaceLogger(alogger);
    this.logBegin(amethodName, aresult);

  }


  public logEnd(aresult?: Rst.IApgRst) {

    if (!this._enabled) return;

    const END = '}';

    if (aresult) {
      const message = aresult.message ? END + " => " + aresult.message : END
      aresult.message = message;
      this.#logResult(aresult);
    }
    else {
      this.logTrace(END);
    }

    this.logger.depth--;
    this._callsStack.pop();

  }


  public logTrace(
    amessage: string
  ) {

    const r: Rst.IApgRst = { ok: true, message: amessage };
    return this.#logResult(r)

  }


  #logResult(aresult: Rst.IApgRst) {

    return this.logger.log(this.className, this.#methodName, aresult);

  }


}

