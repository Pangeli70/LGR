/** -----------------------------------------------------------------------
 * @module [apg-lgr]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.7 [APG 2023/05/06] Separation of concerns lib/src
 * ------------------------------------------------------------------------
 */

export * as Lgr from "../lib/mod.ts" 

// https://deno.land/std/dotenv/load autoload env file
import "https://deno.land/std@0.188.0/dotenv/load.ts";

// https://deno.land/x/mongo
export * as Mongo from "https://deno.land/x/mongo@v0.31.2/mod.ts";

// Apg github repos
export * as Uts from "https://raw.githubusercontent.com/Pangeli70/apg-uts/master/mod.ts";
export * as Rst from "https://raw.githubusercontent.com/Pangeli70/apg-rst/master/mod.ts";
export * as Mng from "https://raw.githubusercontent.com/Pangeli70/apg-mng/master/mod.ts";
export * as Spc from "https://raw.githubusercontent.com/Pangeli70/apg-spc/master/mod.ts";

// Apg local monorepo
// export * as Uts from "../apg-uts/mod.ts";
// export * as Rst from "../apg-rst/mod.ts";
// export * as Mng from "../apg-mng/mod.ts";