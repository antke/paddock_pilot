/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as careReminders from "../careReminders.js";
import type * as devSeed from "../devSeed.js";
import type * as emails from "../emails.js";
import type * as eventHorseDetails from "../eventHorseDetails.js";
import type * as events from "../events.js";
import type * as horseCareSummary from "../horseCareSummary.js";
import type * as horseHealthIssues from "../horseHealthIssues.js";
import type * as horseMedicationRecords from "../horseMedicationRecords.js";
import type * as horseNutritionLogs from "../horseNutritionLogs.js";
import type * as horseTimeline from "../horseTimeline.js";
import type * as horseWeightRecords from "../horseWeightRecords.js";
import type * as horses from "../horses.js";
import type * as http from "../http.js";
import type * as libs_auth from "../libs/auth.js";
import type * as libs_entitlements from "../libs/entitlements.js";
import type * as libs_stablePermissions from "../libs/stablePermissions.js";
import type * as stableAnalysis from "../stableAnalysis.js";
import type * as stableDashboardAlerts from "../stableDashboardAlerts.js";
import type * as stableDocuments from "../stableDocuments.js";
import type * as stableInvitations from "../stableInvitations.js";
import type * as stableMembers from "../stableMembers.js";
import type * as stableProviders from "../stableProviders.js";
import type * as stables from "../stables.js";
import type * as userCareOverview from "../userCareOverview.js";
import type * as userSubscriptions from "../userSubscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  careReminders: typeof careReminders;
  devSeed: typeof devSeed;
  emails: typeof emails;
  eventHorseDetails: typeof eventHorseDetails;
  events: typeof events;
  horseCareSummary: typeof horseCareSummary;
  horseHealthIssues: typeof horseHealthIssues;
  horseMedicationRecords: typeof horseMedicationRecords;
  horseNutritionLogs: typeof horseNutritionLogs;
  horseTimeline: typeof horseTimeline;
  horseWeightRecords: typeof horseWeightRecords;
  horses: typeof horses;
  http: typeof http;
  "libs/auth": typeof libs_auth;
  "libs/entitlements": typeof libs_entitlements;
  "libs/stablePermissions": typeof libs_stablePermissions;
  stableAnalysis: typeof stableAnalysis;
  stableDashboardAlerts: typeof stableDashboardAlerts;
  stableDocuments: typeof stableDocuments;
  stableInvitations: typeof stableInvitations;
  stableMembers: typeof stableMembers;
  stableProviders: typeof stableProviders;
  stables: typeof stables;
  userCareOverview: typeof userCareOverview;
  userSubscriptions: typeof userSubscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
