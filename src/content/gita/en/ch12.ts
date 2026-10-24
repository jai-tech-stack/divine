import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 12 — English meanings written for Divine Life. */
const T: string[] = [
  'Arjuna said: Those devotees who, ever united, worship you thus, and those who worship the imperishable unmanifest — which of them knows yoga better?',
  'The Lord said: Those who fix their minds on me and worship me, ever united, with supreme faith — I consider them the most united.',
  'But those who worship the imperishable, the indefinable, the unmanifest, all-pervading, unthinkable, unchanging, immovable and constant,',
  'restraining all the senses, even-minded everywhere, delighting in the welfare of all beings — they too reach me.',
  'The difficulty is greater for those whose minds are set on the unmanifest, for the unmanifest goal is hard for embodied beings to reach.',
  'But those who surrender all actions to me, hold me as the highest, and worship me meditating with undivided yoga —',
  'for them, whose minds are fixed on me, I soon become the deliverer from the ocean of death and rebirth, Partha.',
  'Fix your mind on me alone, rest your understanding in me; you will then live in me hereafter, without doubt.',
  'If you cannot keep your mind steadily on me, then seek to reach me through the yoga of practice, Dhananjaya.',
  'If you are not able even to practise, be devoted to work for me; doing actions for my sake, you will attain perfection.',
  'If you cannot do even this, then take refuge in me and, self-controlled, give up the fruits of all actions.',
  'Knowledge is better than practice; meditation is better than knowledge; giving up the fruits of action is better than meditation; from such giving up, peace follows at once.',
  'One who hates no being, who is friendly and compassionate, free from "mine" and ego, even in pain and pleasure, forgiving,',
  'ever content, a yogi, self-controlled, firm in resolve, with mind and intellect offered to me — that devotee of mine is dear to me.',
  'One by whom the world is not troubled and who is not troubled by the world, free from excitement, envy, fear and agitation — that one is dear to me.',
  'One who expects nothing, is pure, skilful, unconcerned, untroubled, who has given up all selfish undertakings — that devotee of mine is dear to me.',
  'One who neither rejoices nor hates, neither grieves nor craves, who has let go of good and bad, full of devotion — that one is dear to me.',
  'The same towards enemy and friend, in honour and dishonour, in cold and heat, pleasure and pain, free from attachment,',
  'equal in blame and praise, silent, content with whatever comes, without attachment to home, steady in mind, full of devotion — that person is dear to me.',
  'But those who follow this nectar of dharma as I have taught it, with faith, holding me as the highest — those devotees are exceedingly dear to me.',
];
export const EN12: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
