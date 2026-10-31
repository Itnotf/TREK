import type { TranslationStrings } from '../types';

const tripPlanning: TranslationStrings = {
  'tripPlanning.title': 'Plan together',
  'tripPlanning.intro': 'Talk it through together. Ask AI to turn your ideas into a trip you can take.',
  'tripPlanning.chat': 'Trip discussion',
  'tripPlanning.proposal': 'Shared plan',
  'tripPlanning.chatHelp': 'Share preferences, links and changes here. Everyone on this trip can read this discussion.',
  'tripPlanning.chatNext': 'Ready? Ask AI to organise the plan',
  'tripPlanning.chatReadOnly':
    'You can read the discussion. Sending messages is disabled for your account on this trip.',
  'tripPlanning.members': 'Members and invitations',
  'tripPlanning.memberCount': '{count} travellers',
  'tripPlanning.memberCount.one': '{count} traveller',
  'tripPlanning.memberHelp': 'Invite others whenever you like. You can keep planning on your own.',
  'tripPlanning.collaborators': 'Who can confirm the itinerary',
  'tripPlanning.collaboratorsHelp':
    'The organiser and selected collaborators can confirm a plan. Other members can discuss and request revisions.',
  'tripPlanning.saveCollaborators': 'Save collaborators',
  'tripPlanning.noOtherMembers': 'Invite a traveller to choose a collaborator.',
  'tripPlanning.emptyTitle': 'What would make this a good trip?',
  'tripPlanning.emptyHelp':
    'Share where you want to go, how many days, who is coming and what matters most. Start with a direction, or ask for a detailed plan.',
  'tripPlanning.emptyExample':
    'For example: five days driving from Chengdu with my parents, easy walks, quiet hotels and time for local food.',
  'tripPlanning.instruction': 'Anything to add or change? (optional)',
  'tripPlanning.instructionPlaceholder': 'For example: make day three easier and keep the booked hotel.',
  'tripPlanning.instructionHelp': 'Your request is shared with the group. AI runs only when you press a button below.',
  'tripPlanning.discuss': 'Organise our ideas',
  'tripPlanning.generate': 'Create detailed plan',
  'tripPlanning.revise': 'Revise detailed plan',
  'tripPlanning.generating': 'AI is reviewing the discussion and preparing a plan. This can take a few minutes.',
  'tripPlanning.confirming': 'Updating the itinerary…',
  'tripPlanning.discussionStatus': 'Direction for discussion',
  'tripPlanning.detailedStatus': 'Detailed proposal · awaiting confirmation',
  'tripPlanning.confirmedStatus': 'Confirmed itinerary',
  'tripPlanning.revision': 'Version {revision}',
  'tripPlanning.agreements': 'Requirements collected',
  'tripPlanning.disagreements': 'Choices still to make',
  'tripPlanning.questions': 'A couple of things to clarify',
  'tripPlanning.questionsHelp': 'Reply in the discussion or add your answer above, then ask AI to update the plan.',
  'tripPlanning.outline': 'The trip, day by day',
  'tripPlanning.day': 'Day {day}',
  'tripPlanning.changes': 'What changed in this version',
  'tripPlanning.confirm': 'Confirm and update itinerary',
  'tripPlanning.confirmHelp': 'Review the plan above. Confirming updates this trip’s daily itinerary and guide.',
  'tripPlanning.memberConfirmHelp':
    'You can suggest changes in the discussion. The organiser or a collaborator confirms the itinerary.',
  'tripPlanning.confirmedHelp':
    'This version has been applied. Keep discussing and generate another proposal whenever plans change.',
  'tripPlanning.baselineChanged':
    'The daily itinerary, stays or bookings changed after this proposal was prepared. Generate an updated proposal before confirming.',
  'tripPlanning.previousConfirmed':
    'Version {revision} remains the confirmed itinerary while you discuss this proposal.',
  'tripPlanning.history': 'View version history',
  'tripPlanning.currentVersion': 'Return to current plan',
  'tripPlanning.historyReadOnly':
    'You are reading an earlier version. Return to the current plan to make changes or confirm.',
  'tripPlanning.historyFailed': 'Version history could not be loaded. Try opening it again.',
  'tripPlanning.historyEmpty': 'No earlier versions yet.',
  'tripPlanning.refresh': 'Refresh shared plan',
  'tripPlanning.aiUnavailable': 'AI is unavailable for this account. You can keep discussing and viewing the plan.',
  'tripPlanning.privacyTitle': 'Before using AI',
  'tripPlanning.privacyHelp':
    'The configured AI service receives this trip’s shared discussion and itinerary to prepare a proposal. Your private AI conversations are not included.',
  'tripPlanning.privacyAccept': 'Allow AI for my requests',
  'tripPlanning.error.load': 'The shared plan could not be loaded. Check your connection and try again.',
  'tripPlanning.error.unavailable': 'This trip is unavailable or you no longer have access.',
  'tripPlanning.error.forbidden': 'You do not have permission for this action. Refresh to check your current access.',
  'tripPlanning.error.stale_revision':
    'Someone updated the plan while you were working. The latest version has been loaded; review it and try again.',
  'tripPlanning.error.baseline_changed':
    'The itinerary changed after this proposal was prepared. Generate an updated proposal; your current itinerary has been kept.',
  'tripPlanning.error.ai_unavailable':
    'AI is unavailable for this account. Check the AI connection in settings, then try again.',
  'tripPlanning.error.privacy_required': 'Please read the AI notice and allow AI for your requests first.',
  'tripPlanning.error.daily_limit': 'Your AI allowance for today is used up. Keep discussing and try again tomorrow.',
  'tripPlanning.error.rate_limited': 'Too many AI requests. Wait a moment, then try again.',
  'tripPlanning.error.busy': 'AI is already preparing a proposal for this trip. Refresh in a moment.',
  'tripPlanning.error.ai_failed':
    'AI could not prepare a valid proposal. Your current plan is safe. Try again with a shorter request.',
  'tripPlanning.discussionRecord': 'Discussion when this proposal was generated (for reference)',
};
export default tripPlanning;
