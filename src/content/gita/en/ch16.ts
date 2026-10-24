import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 16 — English meanings written for Divine Life. */
const T: string[] = [
  'The Lord said: Fearlessness, purity of heart, steadfastness in knowledge and yoga, charity, self-control, sacrifice, study of scripture, austerity, uprightness,',
  'non-violence, truth, freedom from anger, renunciation, peace, not speaking ill of others, compassion for beings, freedom from greed, gentleness, modesty, steadiness,',
  'vigour, forgiveness, fortitude, purity, freedom from malice and from excessive pride — these belong to one born with the divine nature, Bharata.',
  'Pretence, arrogance, self-conceit, anger, harshness and ignorance belong to one born with the demonic nature, Partha.',
  'The divine nature leads to freedom, the demonic to bondage. Do not grieve, Pandava; you are born with the divine nature.',
  'There are two kinds of beings in this world, the divine and the demonic. The divine has been described at length; now hear from me about the demonic, Partha.',
  'The demonic do not know what to do and what to refrain from; neither purity, nor good conduct, nor truth is found in them.',
  'They say the world is without truth, without foundation, without God, born of mutual union, with desire as its only cause.',
  'Holding this view, these lost souls of small understanding and cruel deeds rise as enemies of the world, for its destruction.',
  'Clinging to insatiable desire, full of pretence, pride and arrogance, grasping false ideas through delusion, they act with impure resolves.',
  'Bound by endless anxieties that last until death, holding the gratification of desire as the highest, convinced that this is all,',
  'bound by hundreds of ropes of hope, given over to desire and anger, they strive to pile up wealth by unjust means for their pleasures.',
  '"This I have gained today; this desire I shall fulfil; this is mine, and this wealth too shall be mine;',
  'that enemy I have slain, and others too I shall slay; I am the lord, I am the enjoyer, I am successful, powerful and happy;',
  'I am rich and well-born — who else is like me? I will sacrifice, I will give, I will rejoice" — so they think, deluded by ignorance.',
  'Bewildered by many thoughts, caught in a net of delusion, addicted to the gratification of desires, they fall into a foul hell.',
  'Self-important, stubborn, full of the pride and intoxication of wealth, they perform sacrifices in name only, with pretence, disregarding the rules.',
  'Given over to ego, force, arrogance, desire and anger, these envious ones hate me, who dwell in their own bodies and in others.',
  'These cruel haters, the lowest of people, I cast again and again into demonic wombs in the cycles of the world.',
  'Entering demonic wombs, deluded birth after birth, never reaching me, son of Kunti, they go to still lower states.',
  'Desire, anger and greed — this is the threefold gate of hell, ruinous to the self. Therefore one should give up these three.',
  'Freed from these three gates of darkness, son of Kunti, a person does what is good for the self and so reaches the highest goal.',
  'One who sets aside the guidance of scripture and acts on the impulse of desire attains neither perfection, nor happiness, nor the highest goal.',
  'Therefore let scripture be your authority in deciding what should and should not be done. Knowing what scripture teaches, you should act here.',
];
export const EN16: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
