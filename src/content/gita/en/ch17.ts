import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 17 — English meanings written for Divine Life. */
const T: string[] = [
  'Arjuna said: Krishna, what is the standing of those who set aside the rules of scripture but worship with faith — is it sattva, rajas or tamas?',
  'The Lord said: The faith of embodied beings, born of their nature, is of three kinds — sattvic, rajasic and tamasic. Hear about it.',
  'Everyone’s faith is in keeping with their nature, Bharata. A person is made of faith; as one’s faith is, so one is.',
  'Sattvic people worship the gods; rajasic people worship yakshas and rakshasas; others, tamasic, worship ghosts and hosts of spirits.',
  'Those who practise severe austerities not taught by scripture, full of pretence and ego, driven by desire, attachment and force,',
  'senselessly tormenting the elements in the body, and me who dwell within the body — know them to be of demonic resolve.',
  'Even the food dear to each is of three kinds, as are sacrifice, austerity and charity. Hear the difference between them.',
  'Foods that increase life, purity, strength, health, happiness and delight, that are juicy, smooth, substantial and pleasing to the heart, are dear to the sattvic.',
  'Foods that are too bitter, sour, salty, hot, pungent, dry and burning, and that bring pain, grief and disease, are liked by the rajasic.',
  'Food that is stale, tasteless, putrid, left over, half-eaten and impure is dear to the tamasic.',
  'Sacrifice offered according to the rules by those not seeking reward, with the mind set on "this ought to be done", is sattvic.',
  'Sacrifice offered seeking reward or for show, best of the Bharatas, know to be rajasic.',
  'Sacrifice without rules, without distributing food, without mantras, without offerings to the priests and without faith is called tamasic.',
  'Reverence for the gods, the twice-born, teachers and the wise; purity, uprightness, self-restraint and non-violence — this is called austerity of the body.',
  'Speech that causes no distress, that is truthful, pleasant and beneficial, and the regular study of scripture — this is called austerity of speech.',
  'Serenity of mind, gentleness, silence, self-control and purity of feeling — this is called austerity of the mind.',
  'This threefold austerity, practised with supreme faith by people not seeking reward and steady in mind, is called sattvic.',
  'Austerity done for respect, honour and reverence, or with pretence, is called rajasic here; it is unstable and fleeting.',
  'Austerity done out of foolish stubbornness, by torturing oneself, or to harm another, is called tamasic.',
  'A gift given because it ought to be given, to one who cannot return the favour, at the right place and time, to a worthy person — that gift is sattvic.',
  'A gift given to get something back, or with an eye on reward, or given grudgingly, is rajasic.',
  'A gift given at the wrong place and time, to unworthy persons, without respect or with contempt, is called tamasic.',
  '"Om Tat Sat" is held to be the threefold name of Brahman. By it the Brahmins, the Vedas and sacrifices were ordained of old.',
  'Therefore acts of sacrifice, charity and austerity, as taught, are always begun by the followers of Brahman with the utterance of "Om".',
  'Saying "Tat", without seeking reward, seekers of freedom perform various acts of sacrifice, austerity and charity.',
  '"Sat" is used in the sense of reality and goodness; and, Partha, the word "Sat" is also used for a praiseworthy act.',
  'Steadfastness in sacrifice, austerity and charity is also called "Sat", and any action for such purposes is also called "Sat".',
  'Whatever is offered, given, or practised as austerity, or done without faith, is called "asat", Partha; it is of no use here or hereafter.',
];
export const EN17: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
