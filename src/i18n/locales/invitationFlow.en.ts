export const invitationFlow = {
  verifyEmailTitle: 'Verify your email to join',
  verifyEmailHelp:
    'Enter the code from your email. If it’s expired or doesn’t work, get a new one here.',
  emailRefreshHelp:
    'Refresh to check for a verified email, or add or verify one in account settings.',
  verificationCode: 'Confirmation code',
  verifyEmail: 'Verify email',
  verifyingEmail: 'Verifying…',
  sendNewCode: 'Send a new code',
  sendingCode: 'Sending code…',
  codeSent:
    'New code sent. Check your inbox and spam, then enter the latest code above.',
  verifyEmailFailed:
    'That code didn’t work. Try again, or get a new one if it’s expired.',
  sendCodeFailed: 'Couldn’t send a new code.',
  refreshAccountFailed: 'Couldn’t refresh your account.',
  refreshingAccount: 'Refreshing account…',
  accountRefreshed:
    'Account refreshed. Still blocked? Check your email is verified in account settings.',
  manageAccount: 'Open account settings',

  switchAccount: 'Switch account',
  refreshAccount: 'Refresh account',
  unavailable: 'Invitation unavailable',
  loadFailed: 'We couldn’t load this invitation',
  loadFailedHelp:
    'Check your connection and try again. Your invitation hasn’t changed.',
  retry: 'Try again',
  response: 'Invitation response',
  notFound: 'Invitation not found',
  notFoundHelp:
    'This link is broken or was replaced. Ask the stable admin for a new invite.',
  returnHome: 'Return home',
  accepting: 'Accepting…',
  declining: 'Declining…',
  signInInvited: 'Sign in with the invited account',
  signInContinue: 'Sign in to continue',
  alreadyLinkedHelp:
    'This invite is already linked to an account. Sign in with it to get to the stable.',
  preparing: 'Preparing your account',
  preparingHelp:
    'You’re signed in. We’re finishing your profile so you can see the invite.',
  wrongEmail: 'This invite is for a different email',
  emailUnavailable: 'Your email isn’t available yet',
  emailUnavailableHelp:
    'We couldn’t find a verified email on your account. Verify it in account settings, then refresh this page.',
  ready: 'Ready to join',
  readyHelp:
    'Accept to join this stable and see its shared records, or decline. Either way, you can create your own stable.',
  retryAccept: 'Try accepting again',
  accept: 'Accept invitation',
  retryDecline: 'Try declining again',
  decline: 'Decline invitation',
  declinedTitle: 'Invitation declined',
  declinedSample: 'Sample invite declined. Nothing real changed.',
  declinedHelp:
    'This invite no longer gives access to the stable. You can carry on with your account or create your own stable.',
  continue: 'Continue',
  createOwn: 'Create my own stable',
  expiredTitle: 'This invitation has expired',
  expiredHelp:
    'Ask the stable admin to resend it. You’ll get a new link that works for 14 days.',
  revokedTitle: 'This invitation was revoked',
  revokedHelp:
    'It can’t be used anymore. Ask the stable admin if you still need access.',
  alreadyUsed: 'This invitation was already used',
  alreadyAccepted: 'This invitation was already accepted',
  anotherAccount: 'It’s linked to another account and can’t be used again.',
  finishActivation: 'Finish activating your membership',
  finishActivationHelp:
    'You no longer need a subscription to join a stable. Activate the invite you accepted to continue.',
  retryActivate: 'Try activating again',
  activate: 'Activate membership',
  leftTitle: 'You’re no longer in {{name}}',
  leftHelp:
    'This link was used when you joined, so it won’t let you back in. Ask the stable owner for a new invite if you’d like to return.',
  alreadyMember: 'You’re already a member',
  activeSample:
    'This sample shows an active membership. No real access was given.',
  activeAnnouncement: 'Your stable membership is active.',
  declinedAnnouncement: 'Invitation declined.',
  location: 'Location',
  notSpecified: 'Not specified',
  invitedBy: 'Invited by',
  administrator: 'Stable admin',
  sentTo: 'Sent to',
  expired: 'Expired',
  expires: 'Expires',
  summary: 'You’re invited to join this stable as a member.',
  linkCopied: 'Invitation link copied',
  copyFailed: 'Couldn’t copy the invite link.',
  copyBlocked:
    'Your browser blocked copying. Allow clipboard access and try again.',
  errorTooSoon: 'You just sent this invite. Wait a minute, then resend it.',
  errorResendLimit:
    'This invite was resent too many times. Revoke it and send a new one.',
  errorTooMany:
    'You’ve sent a lot of invites in the last hour. Try again later.',
  errorHasAccess: 'This person already has access to the stable.',
  errorAlreadyInvited:
    'This email is already on your invite list, even if that invite expired. Resend it from there.',
  errorExpired: 'This invite has expired. Ask the stable admin for a new one.',
  errorWrongEmail:
    'Sign in with the email the invite was sent to, then try again.',
  queuedAgain: 'Invitation queued again',
  queuedShort: 'Email queued',
  copy: 'Copy link',
  resendFailed: 'Couldn’t resend the invite.',
  revokeFailed: 'Couldn’t revoke the invite.',
  revoked: 'Invitation revoked',
  empty: 'No invitations yet.',
  resending: 'Resending...',
  resend: 'Resend',
  revoke: 'Revoke',
  revokeHelp:
    'The link stops working right away. You can invite them again later if they need access.',
  keep: 'Keep invitation',
  revoking: 'Revoking...',
  revokeInvitation: 'Revoke invitation',
  emailNotSent: 'Email not sent',
  context: 'Stable invitation',

  useEmail: 'Use {{email}} so we can match this invite to you.',
  wrongEmailHelp:
    'Sign in with {{email}} to accept it. Your current account doesn’t have access.',
  welcome: 'Welcome to {{name}}',
  activeHelp:
    'You have access to {{name}}. Go to the stable, or create your own.',
  continueStable: 'Continue to {{name}}',
  sampleAccepted: 'Sample invitation accepted. No real membership changed.',
  sampleDeclined: 'Sample invitation declined. No real membership changed.',
  acceptFailed: 'Couldn’t accept the invitation.',
  declineFailed: 'Couldn’t decline the invitation.',
  freshLink: 'New link created for {{email}}.',
  revokedFor: '{{email}} can no longer accept this invite.',
  revokeConfirm: 'Revoke invitation for {{email}}?',
  lastSent: 'Last sent {{date}}',
  expiresOn: 'Expires {{date}}',
  expiredOn: 'Expired {{date}}',
  deliveryError:
    'Delivery failed. Check the address and resend, or share the link yourself.',
  member: 'Member',
  status: {
    pending: 'Pending',
    accepted_pending_subscription: 'Accepted, ready to activate',
    accepted: 'Accepted',
    declined: 'Declined',
    revoked: 'Revoked',
    expired: 'Expired',
  },
  delivery: {
    queued: 'Email queued',
    sent: 'Email sent',
    failed: 'Delivery failed',
    skipped: 'Not sent in this environment',
  },
} as const
