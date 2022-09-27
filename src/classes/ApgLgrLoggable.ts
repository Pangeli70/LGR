/** ---------------------------------------------------------------------------
* @module [Logs]
* @author [APG] ANGELI Paolo Giusto
* @version 0.2.0 [APG 2018/06/02]
* @version 0.5.1 [APG 2019/01/07]
* @version 0.7.0 [APG 2019/08/15]
* @version 0.7.1 [APG 2019/08/27]
* @version 0.8.0 [APG 2022/03/12] Porting to Deno
* @version 0.9.0 [APG 2022/08/09] Code smells and metrics
* @version 0.9.1 [APG 2022/09/24] Github Beta
* -----------------------------------------------------------------------------
*/

import { Rst } from "../../deps.ts";
import { ApgLgr } from './ApgLgr.ts';


/** 
 * Base class for inheritance or composition of objects that can log events
 */
export class ApgLgrLoggable {

  /** Class name */
  readonly className: string;
  /** Stack for nested logBegin/logEnd methods */
  private __callsStack: string[] = [];
  /** Events logger */
  protected _logger: ApgLgr;


  get #methodName() {

    return this.__callsStack[this.__callsStack.length - 1];

  }

  constructor(aclassName: string, alogger: ApgLgr) {

    this.className = aclassName;

    Rst.ApgRstAssert.IsUndefined(
      alogger,
      'Logger undefined for constructor of class' + aclassName,
      true
    );

    this._logger = alogger;

  }


  public replaceLogger(alogger: ApgLgr) {

    Rst.ApgRstAssert.IsUndefined(
      alogger,
      'Logger undefined for constructor of class' + this.className,
      true
    );

    this._logger = alogger;
  }


  public logBegin(amethodName: string, aresult?: Rst.ApgRst) {

    const BEGIN = "{"

    this.__callsStack.push(amethodName);
    this._logger.depth++;

    if (aresult) {
      const ir = aresult.AsIApgRst;
      const message = ir.message ? BEGIN + " => " + ir.message : BEGIN
      const r = this.#updateMessageResult(ir, message);
      this.#logResult(r);
    }
    else {
      this.logTrace(BEGIN);
    }
  }


  logBeginUsing(
    alogger: ApgLgr,
    amethodName: string,
    aresult?: Rst.ApgRst
  ) {

    this.replaceLogger(alogger);
    this.logBegin(amethodName, aresult);

  }


  public logEnd(aresult?: Rst.ApgRst) {

    const END = '}';

    if (aresult) {
      const ir = aresult.AsIApgRst;
      const message = ir.message ? END + " => " + ir.message : END
      const r = this.#updateMessageResult(ir, message);
      this.#logResult(r);
    }
    else {
      this.logTrace(END);
    }

    this._logger.depth--;
    this.__callsStack.pop();

  }


   #updateMessageResult(aresult: Rst.IApgRst, amessage: string) {
    
    const r = new Rst.ApgRst({
      error: aresult.error,
      message: amessage,
      payload: aresult.payload,
      codedMessage: aresult.codedMessage
    });
    return r;
  }


  public logTrace(
    amessage: string
  ) {

    const r = new Rst.ApgRst({ message: amessage })
    return this.#logResult(r)

  }


  #logResult(aresult: Rst.ApgRst) {

    return this._logger.log(this.className, this.#methodName, aresult);

  }


}

