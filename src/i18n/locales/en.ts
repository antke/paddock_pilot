import { horseComparison } from './horseComparison.en'
import { serverErrors } from './serverErrors.en'
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

export const en = {
  horseComparison,
  serverErrors,
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
    recentHelp: 'Important stable, membership and event changes, newest first.',
    empty: 'No audited activity has been recorded yet.',
    list: 'Recent stable changes',
    stableCreated: 'Stable created',
    stableUpdated: 'Stable details updated',
    stableArchived: 'Stable archived',
    memberInvited: 'Member invited',
    invitationResent: 'Member invitation resent',
    invitationRevoked: 'Member invitation revoked',
    invitationAccepted: 'Member invitation accepted',
    invitationDeclined: 'Member invitation declined',
    accessActivated: 'Member access activated',
    invitationPendingPlan: 'Member invitation accepted, awaiting plan',
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
    nameMin: 'Name must have at least 3 characters.',
    nameMax: 'Name cannot be longer than 50 characters.',
    nameCharacters: 'Name contains unsupported characters.',
    locationMin: 'Location must have at least 3 characters.',
    locationMax: 'Location cannot be longer than 50 characters.',
    locationCharacters: 'Location contains unsupported characters.',
    descriptionMax: 'Please use a shorter description',
    shortTextMax: 'Please use a shorter value.',
    phoneMax: 'Please use a shorter phone number.',
    noteMax: 'Please use a shorter note.',
    emergencyContactMax: 'Please use a shorter emergency contact.',
  },
  invitations: {
    linkCopied: 'Invitation link copied',
    copyFailed: 'Could not copy invitation link',
    created: 'Invitation created',
    queued: 'The email is queued for {{email}}.',
    copy: 'Copy link',
    email: 'Email address',
    invite: 'Invite',
    inviting: 'Inviting...',
    failed:
      'Could not create the invitation. Check the email address and try again.',
    invalidEmail: 'Use a valid email address.',
    language: 'Invitation language',
    languageHelp:
      'For new recipients. Existing accounts receive emails in their saved language.',
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
    trimDone: 'Trim completed. Next visit to be arranged.',
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
    errorDescription:
      'Available plans couldn’t be loaded. Try again in a moment.',
    retry: 'Retry loading plans',
    description: 'Review available plans and billing options.',
    testingDescription:
      'Stable operations are available to every member during testing. When billing launches, the premium plan will add the Analysis Centre; all other current features remain part of the core product.',
    return: 'Return to invitation',
    testingTitle: 'Testing access',
    testingAccess:
      'Billing is not enabled in this environment. Testers can use every current Paddock Pilot feature without choosing a plan or entering payment details.',
    included: 'Included',
    start: 'Start setup',
    care: 'Care records',
    careDescription: 'Track reminders, visits, notes, and outcomes.',
    team: 'Stable team',
    teamDescription: 'Coordinate owners, providers, and members.',
    analysis: 'Analysis centre',
    analysisDescription: 'Review care gaps, cadence, and printable summaries.',
  },
  profileForm: {
    saveFailedTitle: 'Could not save your profile',
    continue: 'Save and continue',
    retryContinue: 'Retry continuing',
    saving: 'Saving...',
    saveFailed:
      'Could not save your profile. Your details and selected image are still here. Please try again.',
    continueFailed:
      'Your profile was saved, but the next step could not finish. Retry continuing; your profile and image will not be saved again.',
    shared: 'Shared across every stable you own or join.',
    preferredName: 'Preferred name',
    phone: 'Phone number',
    optional: 'Optional',
    imageLabel: 'Profile image (optional)',
    imageUpload: 'Add a profile image',
    imageDescription:
      'A photo helps other stable members recognise you. Image files only, up to 5 MB.',
    imageHelp: 'Choose an image up to 5 MB.',
    nameRequired: 'Add the name people should use.',
    imageRequired: 'Choose an image file.',
    imageTooLarge: 'Choose an image no larger than 5 MB.',
  },
  upload: {
    about: 'About {{label}}',
    remove: 'Remove {{name}}',
    replace: 'Replace {{name}}',
    dropImage: 'Drop an image here or browse',
    dropFile: 'Drop a file here or browse',
    imageTypes: 'JPG, PNG or WEBP',
    chooseFile: 'Choose a file from your device',
    image: 'Image',
    file: 'File',
  },
  recovery: {
    title: 'Could not prepare your account',
    description:
      'We couldn’t refresh your account details. Try again to continue. If this keeps happening, reload the page or sign out and sign in again.',
    refreshing: 'Refreshing your account…',
    failed:
      'Your account still couldn’t be refreshed. You can try reloading or signing in again.',
    signOutFailed:
      'We couldn’t sign you out. Check your connection and try again, or reload the page.',
    retrying: 'Trying again…',
    reload: 'Reload page',
    signOut: 'Sign out',
    signingOut: 'Signing out…',
    retryFailed: 'That retry couldn’t finish. Please try again.',
    loadingPage: 'Loading page…',
    stableTitle: 'Stable not found',
    horseTitle: 'Horse not found',
    eventTitle: 'Event not found',
    stableDescription: 'This stable does not exist or is no longer available.',
    horseDescription: 'This horse does not exist or is no longer available.',
    eventDescription: 'This event does not exist or is no longer available.',
  },
  language: {
    label: 'Language',
    description:
      'Choose the language for the app and emails from Paddock Pilot.',
    saving: 'Saving language…',
    saveFailed:
      'Your language changed here, but could not be saved to your account. Try again.',
    retry: 'Save language again',
  },
  navigation: {
    primary: 'Primary navigation',
    public: 'Public navigation',
    footer: 'Footer navigation',
    home: 'Home',
    stables: 'Stables',
    plans: 'Plans',
    horses: 'Horses',
    care: 'Care',
    events: 'Events',
    training: 'Training log',
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
    auto: 'Theme mode: auto (system). Click to switch to light mode.',
    light: 'Theme mode: light. Click to switch mode.',
    dark: 'Theme mode: dark. Click to switch mode.',
  },
  profile: {
    signInTitle: 'Sign in to edit your profile',
    signInDescription:
      'Your profile follows you across the stables you own and join.',
    title: 'Your profile',
    details: 'Profile details',
    save: 'Save profile',
    saved: 'Profile updated',
    errorTitle: 'Your profile couldn’t load',
    errorDescription:
      'Check your connection, then try again. Your profile has not been changed.',
  },
  common: {
    close: 'Close',
    keepEditing: 'Keep editing',
    reset: 'Reset',
    errorToast: 'Oops! Something went wrong.',
    validationToast: 'Check the form',
    tryAgain: 'Please try again.',
    notifications: 'Notifications',
    closeNotification: 'Close toast',

    pageErrorTitle: 'This page couldn’t load',
    pageErrorDescription:
      'Try again. If the problem continues, you can return home.',
    retry: 'Try again',
    home: 'Go home',
    cancel: 'Cancel',
    save: 'Save',
    loading: 'Loading',
    notFoundTitle: 'Page not found',
    notFoundDescription:
      'The page you are looking for does not exist or has moved.',
  },
  counts: {
    horses_one: '{{count}} horse',
    horses_other: '{{count}} horses',
  },
} as const
