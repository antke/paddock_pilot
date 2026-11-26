import { stableUpdates } from './stableUpdates.en'
import { horseComparison } from './horseComparison.en'
import { serverErrors } from './serverErrors.en'
import { actionErrors } from './actionErrors.en'
import { uiRemainder } from './uiRemainder.en'
import { analysisViews } from './analysisViews.en'
import { trainingViews } from './trainingViews.en'
import { eventEditor } from './eventEditor.en'
import { trainingValidation } from './trainingValidation.en'
import { eventValidation } from './eventValidation.en'
import { eventForm } from './eventForm.en'
import { eventViews } from './eventViews.en'
import { reminders } from './reminders.en'
import { horseHistory } from './horseHistory.en'
import { documents } from './documents.en'
import { careFilters } from './careFilters.en'
import { careRecords } from './careRecords.en'
import { careValidation } from './careValidation.en'
import { horseDetail } from './horseDetail.en'
import { horseDeletion } from './horseDeletion.en'
import { horseForm } from './horseForm.en'
import { horseValidation } from './horseValidation.en'
import { training } from './training.en'
import { listControls } from './listControls.en'
import { horseList } from './horseList.en'
import { stableAlerts } from './stableAlerts.en'
import { careLabels } from './careLabels.en'
import { dashboard } from './dashboard.en'
import { calendar } from './calendar.en'
import { stableSetup } from './stableSetup.en'
import { stables } from './stables.en'
import { events } from './events.en'
import { invitationFlow } from './invitationFlow.en'
import { onboarding } from './onboarding.en'
import { navigationShell } from './navigationShell.en'
import { landingDirections } from './landingDirections.en'
import { publicLanding } from './publicLanding.en'

export const en = {
  landingDirections,
  publicLanding,
  navigationShell,
  stableUpdates,
  horseComparison,
  serverErrors,
  actionErrors,
  uiRemainder,
  analysisViews,
  trainingViews,
  eventEditor,
  trainingValidation,
  eventValidation,
  eventForm,
  eventViews,
  reminders,
  horseHistory,
  documents,
  careFilters,
  careRecords,
  careValidation,
  horseDetail,
  horseDeletion,
  horseForm,
  horseValidation,
  training,
  listControls,
  horseList,
  stableAlerts,
  careLabels,
  dashboard,
  calendar,
  stableSetup,
  invitationFlow,
  events,
  stables,
  breadcrumbs: {
    dashboard: 'Dashboard',
    navigation: 'breadcrumb',
    more: 'More',
    activity: 'Activity',
    training: 'Training',
    care: 'Care',
    careSummary: 'Care summary',
    documents: 'Documents',
    editHorse: 'Edit horse',
    nutrition: 'Nutrition',
    timeline: 'Timeline',
    overview: 'Overview',
    horses: 'Horses',
    addHorse: 'Add horse',
    deletedHorses: 'Deleted horses',
    horse: 'Horse',
    trainingLog: 'Training log',
    addSession: 'Add training session',
    session: 'Training session',
    editSession: 'Edit training session',
    events: 'Events',
    calendar: 'Calendar',
    addEvent: 'Add event',
    event: 'Event',
    editEvent: 'Edit event',
    analysis: 'Analysis',
    editStable: 'Edit stable',
    people: 'Stable people',
    settings: 'Settings',
    gettingStarted: 'Getting started',
  },
  audit: {
    recent: 'Recent changes',
    recentHelp: 'Changes to the stable, members and events, newest first.',
    empty: 'No changes yet.',
    list: 'Recent stable changes',
    stableCreated: 'Stable created',
    stableUpdated: 'Stable details updated',
    stableArchived: 'Stable archived',
    memberInvited: 'Member invited',
    invitationResent: 'Invitation resent',
    invitationRevoked: 'Invitation cancelled',
    invitationAccepted: 'Invitation accepted',
    invitationDeclined: 'Invitation declined',
    accessActivated: 'Member access activated',
    invitationPendingPlan: 'Invitation accepted, waiting for a plan',
    memberRemoved: 'Member removed',
    eventCreated: 'Event created',
    eventUpdated: 'Event updated',
    horseApproved: 'Horse invitation approved',
    horseDeclined: 'Horse invitation declined',
    horseWithdrawn: 'Horse withdrawn from event',
    changed: 'Record changed',
    formerUser: 'Former user',
    legacyMemberRemoved: 'Removed member {{id}}',
  },
  onboarding,
  stableValidation: {
    nameMin: 'Name needs at least 3 characters.',
    nameMax: 'Use a shorter name (max 50 characters).',
    nameCharacters: 'Name has unsupported characters.',
    locationMin: 'Location needs at least 3 characters.',
    locationMax: 'Use a shorter location (max 50 characters).',
    locationCharacters: 'Location has unsupported characters.',
    descriptionMax: 'Use a shorter description.',
    shortTextMax: 'Use a shorter value (max 100 characters).',
    phoneMax: 'Use a shorter phone number.',
    noteMax: 'Use a shorter note.',
    emergencyContactMax: 'Use a shorter emergency contact.',
  },
  invitations: {
    linkCopied: 'Invitation link copied',
    copyFailed: 'Couldn’t copy invitation link',
    created: 'Invitation created',
    queued: 'We’ll email {{email}} shortly.',
    copy: 'Copy link',
    email: 'Email address',
    invite: 'Invite',
    inviting: 'Inviting...',
    failed: 'Couldn’t send the invite.',
    invalidEmail: 'Enter a valid email.',
    language: 'Invitation language',
    languageHelp:
      'For new people. Anyone with an account gets emails in their own language.',
  },
  landing: {
    hero1: 'A little less admin.',
    hero2: 'A little more time',
    hero3: 'at the yard.',
    intro:
      'One shared place for your stable’s plans, horse records and everyday care—so everyone knows what’s happening.',
    createAccount: 'Create your account',
    yardPhoto:
      'A chestnut horse looking out over the stable gate in the evening light.',
    careTitle: 'Juniper’s care',
    example: 'Example',
    visitStatus: 'Example visit status',
    planned: 'Planned',
    completed: 'Completed',
    farrier: 'Farrier visit',
    visitTime: 'Thursday · 10:30',
    trimDone: 'Trim done. Next visit to book.',
    farrierName: 'Sam Taylor, farrier.',
    sharedTitle1: 'Good care is',
    sharedTitle2: 'a shared effort.',
    sharedDescription:
      'No more searching through old messages, notebooks or post-it notes. Everything you need is in one place, so you can spend more time on what matters.',
    horseRecord: 'Example horse record',
    horseBreadcrumb: 'Horses / Juniper',
    horsePhoto: 'Juniper, a palomino horse with a golden coat and ivory mane.',
    startTitle1: 'Make yourself',
    startTitle2: 'at home.',
    startDescription:
      'Create your stable, add your horse and invite your friends.',
    siteDescription:
      'Horse care records, reminders, schedules, and provider details in one calm field office for the yard.',
  },
  pricing: {
    options: 'Plan options',
    errorTitle: 'Plans couldn’t load',
    errorDescription: 'Try again in a moment.',
    retry: 'Retry loading plans',
    description: 'Plans and billing options.',
    testingDescription:
      'While we’re testing, every member gets everything. When billing starts, premium adds the Analysis Centre; everything else stays in the core plan.',
    return: 'Back to invitation',
    testingTitle: 'Testing access',
    testingAccess:
      'Billing is off here. Testers can use every feature without picking a plan or adding payment details.',
    included: 'Included',
    start: 'Start setup',
    care: 'Care records',
    careDescription: 'Track reminders, visits, notes, and outcomes.',
    team: 'Stable team',
    teamDescription: 'Keep owners, vets and members in sync.',
    analysis: 'Analysis centre',
    analysisDescription: 'Care gaps, regularity and printable summaries.',
  },
  profileForm: {
    continue: 'Save and continue',
    retryContinue: 'Try again',
    saving: 'Saving...',
    saveFailed:
      'Couldn’t save your profile. Your details and image are still here.',
    continueFailed:
      'Your profile is saved, but the next step didn’t finish. Try again; we won’t save your profile or image twice.',
    shared: 'Shared across every stable you own or join.',
    preferredName: 'Preferred name',
    phone: 'Phone number',
    imageLabel: 'Profile image',
    imageUpload: 'Add a profile image',
    imageDescription:
      'A photo helps people at the yard recognise you. Images up to 5 MB.',
    nameRequired: 'Add the name people should use.',
    imageRequired: 'Choose an image file.',
    imageTooLarge: 'Choose an image up to 5 MB.',
    imageHint: 'JPG, PNG or WEBP, up to 5 MB',
  },
  upload: {
    selected: 'Selected · not saved yet',
    selectedNamed: '{{name}} selected. Save to attach it.',
    releaseToSelect: 'Drop to select this file',
    chooseImage: 'Choose an image',
    chooseFileLabel: 'Choose a file',
    about: 'About {{label}}',
    remove: 'Remove {{name}}',
    replace: 'Replace {{name}}',
    dropImage: 'Drop an image here or browse',
    dropFile: 'Drop a file here or browse',
    imageTypes: 'JPG, PNG or WEBP',
    replaceImage: 'Replace photo',
    addPhoto: 'Add photo',
    changePhoto: 'Change photo',
    currentImage: 'Current photo. Choose or drop a new image to replace it.',
    chooseFile: 'Choose a file from your device',
    image: 'Image',
    file: 'File',
  },
  recovery: {
    title: 'Couldn’t prepare your account',
    description:
      'We couldn’t refresh your account. Try again. If it keeps happening, reload the page or sign out and back in.',
    refreshing: 'Refreshing your account…',
    failed:
      'Still couldn’t refresh your account. Try reloading or signing in again.',
    signOutFailed:
      'We couldn’t sign you out. Check your connection and try again, or reload the page.',
    retrying: 'Trying again…',
    reload: 'Reload page',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    retryFailed: 'Couldn’t load the page again.',
    loadingPage: 'Loading page…',
    stableTitle: 'Stable not found',
    horseTitle: 'Horse not found',
    eventTitle: 'Event not found',
    stableDescription: 'This stable doesn’t exist or is no longer available.',
    horseDescription: 'This horse doesn’t exist or is no longer available.',
    eventDescription: 'This event doesn’t exist or is no longer available.',
  },
  language: {
    label: 'Language',
    description:
      'Choose the language for the app and emails from Paddock Pilot.',
    saving: 'Saving language…',
    saveFailed:
      'Language changed here, but we couldn’t save it to your account. Try again.',
    retry: 'Save language again',
  },
  currency: {
    label: 'Currency',
    description:
      'Used for costs. It follows your country until you choose one here.',
    saveFailed: 'Couldn’t save your currency',
  },
  navigation: {
    accountPreferences: 'Preferences',
    stable: 'Stable',
    today: 'Today',
    calendar: 'Calendar',

    primary: 'Primary navigation',
    public: 'Public navigation',
    footer: 'Footer navigation',
    home: 'Home',
    stables: 'Stables',
    plans: 'Plans',
    horses: 'Horses',
    care: 'Care',
    events: 'Events',
    training: 'Training',
    documents: 'Documents',
    analysis: 'Analysis',
    signIn: 'Sign in',
    create: 'Create',
    createAccount: 'Create account',
    skip: 'Skip to content',
    brandHome: 'Paddock Pilot home',
    profile: 'Your profile',
    manageStables: 'Manage stables',
    billing: 'Plans and billing',
    activeStable: 'Active stable',
    selectStable: 'Select stable',
    activeStableName: 'Active stable: {{name}}',
    overview: 'Stable overview',
    people: 'Stable people',
    gettingStarted: 'Getting started',
    settings: 'Stable settings',
  },
  footer: {
    description: 'Clearer horse records and care coordination for the yard.',
    copyright: '© {{year}} Paddock Pilot. All rights reserved.',
  },
  theme: {
    auto: 'Theme: auto (system). Click for light mode.',
    light: 'Theme: light. Click to switch.',
    dark: 'Theme: dark. Click to switch.',
  },
  profile: {
    notifications: 'Email reminders',
    notificationsDescription: 'Choose which emails Paddock Pilot sends you.',
    digestLabel: 'Daily care summary',
    digestDescription:
      'One email around 09:00 ({{timezone}}) when any of your stables has care due or overdue. Off by default; reminders are always in Care.',
    digestSaved: 'Email preference saved',
    digestError: 'Couldn’t save your email setting',
    signInTitle: 'Sign in to edit your profile',
    signInDescription:
      'Your profile follows you across the stables you own and join.',
    title: 'Your profile',
    detailsDescription: 'How people at your stables see and reach you.',
    save: 'Save profile',
    saved: 'Profile saved',
    errorTitle: 'Your profile couldn’t load',
    errorDescription:
      'Check your connection, then try again. Your profile hasn’t changed.',
  },
  common: {
    aboutField: 'About {{label}}',
    unsavedTitle: 'Leave without saving?',
    unsavedHelp:
      'Your changes aren’t saved. Stay to finish, or leave and lose them.',
    leaveWithoutSaving: 'Leave without saving',
    close: 'Close',
    keepEditing: 'Keep editing',
    reset: 'Reset',
    discardChanges: 'Discard changes',
    errorToast: 'Something went wrong.',
    validationToast: 'Check the form',
    tryAgain: 'Try again.',
    notifications: 'Notifications',
    closeNotification: 'Close toast',

    pageErrorTitle: 'This page couldn’t load',
    pageErrorDescription: 'Try again. If it keeps happening, go home.',
    retry: 'Try again',
    copied: 'Copied',
    copying: 'Copying…',
    home: 'Go home',
    cancel: 'Cancel',
    edit: 'Edit',
    add: 'Add',
    all: 'All',
    actions: 'Actions',
    save: 'Save',
    saved: 'Saved',
    loading: 'Loading',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This page doesn’t exist or has moved.',
  },
  counts: {
    horses_one: '{{count}} horse',
    horses_other: '{{count}} horses',
  },
} as const
