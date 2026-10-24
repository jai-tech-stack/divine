import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 8 — English meanings written for Divine Life. */
const T: string[] = [
  'Arjuna said: Supreme Person, what is Brahman? What is the self? What is action? What is called the material realm, and what the divine realm?',
  'Madhusudana, who is the lord of sacrifice here in this body, and how? And how are you to be known at the time of death by the self-controlled?',
  'The Lord said: Brahman is the supreme imperishable; one’s own essential nature is called the self; the creative force that brings beings into existence is called action.',
  'The perishable existence is the material realm; the cosmic Person is the divine realm; and I myself, best of the embodied, am the lord of sacrifice here in the body.',
  'Whoever at the time of death leaves the body remembering me alone attains my being; there is no doubt of this.',
  'Whatever state one remembers on leaving the body at the end, son of Kunti, that state one reaches, having always been absorbed in it.',
  'So remember me at all times, and fight. With mind and intellect offered to me, you will surely come to me.',
  'With a mind trained by practice, not wandering elsewhere, constantly meditating, Partha, one reaches the divine Supreme Person.',
  'One who meditates on the all-knowing, the ancient, the ruler, subtler than the subtlest, the support of all, of unthinkable form, radiant like the sun, beyond darkness —',
  'at the time of departure, with an unmoving mind, joined with devotion and the strength of yoga, fixing the life-breath between the brows, reaches that divine Supreme Person.',
  'I will tell you briefly of that state which knowers of the Veda call imperishable, which ascetics free from passion enter, and for which people live in celibacy.',
  'Closing all the gates of the senses, holding the mind in the heart, fixing the life-breath in the head, established in yogic concentration,',
  'uttering the single syllable Om, which is Brahman, and remembering me, one who departs leaving the body reaches the highest goal.',
  'For the ever-united yogi who remembers me constantly, every day, with no other thought, I am easy to reach, Partha.',
  'Having come to me, the great souls who have reached supreme perfection do not again take birth, which is the home of sorrow and impermanent.',
  'All worlds up to the world of Brahma return again, Arjuna; but for one who reaches me, son of Kunti, there is no rebirth.',
  'Those who know that a day of Brahma lasts a thousand ages and a night lasts a thousand ages truly know day and night.',
  'At the coming of the day, all manifest things arise from the unmanifest; at the coming of the night they dissolve into that same unmanifest.',
  'This same multitude of beings, coming forth again and again, dissolves helplessly at nightfall, Partha, and comes forth at daybreak.',
  'But beyond that unmanifest there is another unmanifest, eternal existence, which does not perish when all beings perish.',
  'That unmanifest is called the imperishable and is said to be the highest goal; reaching it, none return. That is my supreme abode.',
  'That Supreme Person, Partha, in whom all beings dwell and by whom all this is pervaded, is reached by undivided devotion.',
  'Now I will tell you, best of the Bharatas, the times at which yogis depart and do not return, and at which they return.',
  'Fire, light, day, the bright fortnight, the six months of the northern course of the sun — departing then, knowers of Brahman go to Brahman.',
  'Smoke, night, the dark fortnight, the six months of the southern course — departing then, the yogi reaches the light of the moon and returns.',
  'These two paths, bright and dark, are considered eternal for the world; by one, one does not return; by the other, one returns again.',
  'Knowing these two paths, Partha, no yogi is deluded. Therefore at all times be steady in yoga, Arjuna.',
  'Whatever merit is said to come from the Vedas, sacrifices, austerities and gifts, the yogi who knows this goes beyond it all and reaches the supreme, original abode.',
];
export const EN8: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
