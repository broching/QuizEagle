/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as mutations_attempts from "../mutations/attempts.js";
import type * as mutations_decks from "../mutations/decks.js";
import type * as mutations_programChat from "../mutations/programChat.js";
import type * as mutations_rateLimit from "../mutations/rateLimit.js";
import type * as mutations_studyPrograms from "../mutations/studyPrograms.js";
import type * as paymentAttemptTypes from "../paymentAttemptTypes.js";
import type * as paymentAttempts from "../paymentAttempts.js";
import type * as queries_decks from "../queries/decks.js";
import type * as queries_studyPrograms from "../queries/studyPrograms.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  files: typeof files;
  http: typeof http;
  "mutations/attempts": typeof mutations_attempts;
  "mutations/decks": typeof mutations_decks;
  "mutations/programChat": typeof mutations_programChat;
  "mutations/rateLimit": typeof mutations_rateLimit;
  "mutations/studyPrograms": typeof mutations_studyPrograms;
  paymentAttemptTypes: typeof paymentAttemptTypes;
  paymentAttempts: typeof paymentAttempts;
  "queries/decks": typeof queries_decks;
  "queries/studyPrograms": typeof queries_studyPrograms;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
