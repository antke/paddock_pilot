/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as activityParticipants from "../activityParticipants.js";
import type * as activitySharing from "../activitySharing.js";
import type * as auditLogs from "../auditLogs.js";
import type * as careReminders from "../careReminders.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as devHorseAnalysisSeed from "../devHorseAnalysisSeed.js";
import type * as devOwnership from "../devOwnership.js";
import type * as devSeed from "../devSeed.js";
import type * as emailDeliveries from "../emailDeliveries.js";
import type * as emailMaintenance from "../emailMaintenance.js";
import type * as emails from "../emails.js";
import type * as eventHorseDetails from "../eventHorseDetails.js";
import type * as events from "../events.js";
import type * as historySharing from "../historySharing.js";
import type * as horseCareSummary from "../horseCareSummary.js";
import type * as horseCollaboration from "../horseCollaboration.js";
import type * as horseHealthIssues from "../horseHealthIssues.js";
import type * as horseMedicationRecords from "../horseMedicationRecords.js";
import type * as horseNutritionLogs from "../horseNutritionLogs.js";
import type * as horseOwnershipSchema from "../horseOwnershipSchema.js";
import type * as horseTimeline from "../horseTimeline.js";
import type * as horseTransitions from "../horseTransitions.js";
import type * as horseWeightRecords from "../horseWeightRecords.js";
import type * as horses from "../horses.js";
import type * as http from "../http.js";
import type * as libs_activitySharing from "../libs/activitySharing.js";
import type * as libs_audit from "../libs/audit.js";
import type * as libs_auth from "../libs/auth.js";
import type * as libs_creationRequests from "../libs/creationRequests.js";
import type * as libs_creatorName from "../libs/creatorName.js";
import type * as libs_dateKeys from "../libs/dateKeys.js";
import type * as libs_email_deliveryPolicy from "../libs/email/deliveryPolicy.js";
import type * as libs_email_layout from "../libs/email/layout.js";
import type * as libs_email_notifications from "../libs/email/notifications.js";
import type * as libs_email_outbox from "../libs/email/outbox.js";
import type * as libs_email_provider from "../libs/email/provider.js";
import type * as libs_email_providers_console from "../libs/email/providers/console.js";
import type * as libs_email_providers_resend from "../libs/email/providers/resend.js";
import type * as libs_email_reminderDigest from "../libs/email/reminderDigest.js";
import type * as libs_email_resendWebhook from "../libs/email/resendWebhook.js";
import type * as libs_email_templates from "../libs/email/templates.js";
import type * as libs_email_types from "../libs/email/types.js";
import type * as libs_entitlements from "../libs/entitlements.js";
import type * as libs_eventAttendees from "../libs/eventAttendees.js";
import type * as libs_eventPermissions from "../libs/eventPermissions.js";
import type * as libs_horseAnalysisDemo from "../libs/horseAnalysisDemo.js";
import type * as libs_horseCareData from "../libs/horseCareData.js";
import type * as libs_horseComparisonRecords from "../libs/horseComparisonRecords.js";
import type * as libs_horseContacts from "../libs/horseContacts.js";
import type * as libs_horseEventHistory from "../libs/horseEventHistory.js";
import type * as libs_horsePermissions from "../libs/horsePermissions.js";
import type * as libs_horseState from "../libs/horseState.js";
import type * as libs_membershipActivation from "../libs/membershipActivation.js";
import type * as libs_onboarding from "../libs/onboarding.js";
import type * as libs_recordCapabilities from "../libs/recordCapabilities.js";
import type * as libs_recordSharing from "../libs/recordSharing.js";
import type * as libs_sharedStableRecords from "../libs/sharedStableRecords.js";
import type * as libs_stablePermissions from "../libs/stablePermissions.js";
import type * as libs_storageObjects from "../libs/storageObjects.js";
import type * as libs_userFacingError from "../libs/userFacingError.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as people from "../people.js";
import type * as personalProviders from "../personalProviders.js";
import type * as recordSharing from "../recordSharing.js";
import type * as sharingMigration from "../sharingMigration.js";
import type * as stableAnalysis from "../stableAnalysis.js";
import type * as stableDashboardAlerts from "../stableDashboardAlerts.js";
import type * as stableDocuments from "../stableDocuments.js";
import type * as stableInvitations from "../stableInvitations.js";
import type * as stableMembers from "../stableMembers.js";
import type * as stableProviders from "../stableProviders.js";
import type * as stableSetup from "../stableSetup.js";
import type * as stableUpdates from "../stableUpdates.js";
import type * as stables from "../stables.js";
import type * as storageMaintenance from "../storageMaintenance.js";
import type * as training from "../training.js";
import type * as userCareOverview from "../userCareOverview.js";
import type * as userSubscriptions from "../userSubscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  activityParticipants: typeof activityParticipants;
  activitySharing: typeof activitySharing;
  auditLogs: typeof auditLogs;
  careReminders: typeof careReminders;
  crons: typeof crons;
  dashboard: typeof dashboard;
  devHorseAnalysisSeed: typeof devHorseAnalysisSeed;
  devOwnership: typeof devOwnership;
  devSeed: typeof devSeed;
  emailDeliveries: typeof emailDeliveries;
  emailMaintenance: typeof emailMaintenance;
  emails: typeof emails;
  eventHorseDetails: typeof eventHorseDetails;
  events: typeof events;
  historySharing: typeof historySharing;
  horseCareSummary: typeof horseCareSummary;
  horseCollaboration: typeof horseCollaboration;
  horseHealthIssues: typeof horseHealthIssues;
  horseMedicationRecords: typeof horseMedicationRecords;
  horseNutritionLogs: typeof horseNutritionLogs;
  horseOwnershipSchema: typeof horseOwnershipSchema;
  horseTimeline: typeof horseTimeline;
  horseTransitions: typeof horseTransitions;
  horseWeightRecords: typeof horseWeightRecords;
  horses: typeof horses;
  http: typeof http;
  "libs/activitySharing": typeof libs_activitySharing;
  "libs/audit": typeof libs_audit;
  "libs/auth": typeof libs_auth;
  "libs/creationRequests": typeof libs_creationRequests;
  "libs/creatorName": typeof libs_creatorName;
  "libs/dateKeys": typeof libs_dateKeys;
  "libs/email/deliveryPolicy": typeof libs_email_deliveryPolicy;
  "libs/email/layout": typeof libs_email_layout;
  "libs/email/notifications": typeof libs_email_notifications;
  "libs/email/outbox": typeof libs_email_outbox;
  "libs/email/provider": typeof libs_email_provider;
  "libs/email/providers/console": typeof libs_email_providers_console;
  "libs/email/providers/resend": typeof libs_email_providers_resend;
  "libs/email/reminderDigest": typeof libs_email_reminderDigest;
  "libs/email/resendWebhook": typeof libs_email_resendWebhook;
  "libs/email/templates": typeof libs_email_templates;
  "libs/email/types": typeof libs_email_types;
  "libs/entitlements": typeof libs_entitlements;
  "libs/eventAttendees": typeof libs_eventAttendees;
  "libs/eventPermissions": typeof libs_eventPermissions;
  "libs/horseAnalysisDemo": typeof libs_horseAnalysisDemo;
  "libs/horseCareData": typeof libs_horseCareData;
  "libs/horseComparisonRecords": typeof libs_horseComparisonRecords;
  "libs/horseContacts": typeof libs_horseContacts;
  "libs/horseEventHistory": typeof libs_horseEventHistory;
  "libs/horsePermissions": typeof libs_horsePermissions;
  "libs/horseState": typeof libs_horseState;
  "libs/membershipActivation": typeof libs_membershipActivation;
  "libs/onboarding": typeof libs_onboarding;
  "libs/recordCapabilities": typeof libs_recordCapabilities;
  "libs/recordSharing": typeof libs_recordSharing;
  "libs/sharedStableRecords": typeof libs_sharedStableRecords;
  "libs/stablePermissions": typeof libs_stablePermissions;
  "libs/storageObjects": typeof libs_storageObjects;
  "libs/userFacingError": typeof libs_userFacingError;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  people: typeof people;
  personalProviders: typeof personalProviders;
  recordSharing: typeof recordSharing;
  sharingMigration: typeof sharingMigration;
  stableAnalysis: typeof stableAnalysis;
  stableDashboardAlerts: typeof stableDashboardAlerts;
  stableDocuments: typeof stableDocuments;
  stableInvitations: typeof stableInvitations;
  stableMembers: typeof stableMembers;
  stableProviders: typeof stableProviders;
  stableSetup: typeof stableSetup;
  stableUpdates: typeof stableUpdates;
  stables: typeof stables;
  storageMaintenance: typeof storageMaintenance;
  training: typeof training;
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
