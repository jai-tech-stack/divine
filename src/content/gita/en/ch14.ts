import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 14 — English meanings written for Divine Life. */
const T: string[] = [
  'The Lord said: I will declare again the supreme knowledge, the best of all knowledge, knowing which all the sages passed from here to the highest perfection.',
  'Taking refuge in this knowledge and attaining a nature like mine, they are not born at creation, nor disturbed at dissolution.',
  'Great nature is my womb; in it I place the seed. From that, Bharata, comes the birth of all beings.',
  'Of all forms born in any womb, son of Kunti, great nature is the womb and I am the seed-giving father.',
  'Sattva, rajas and tamas — these gunas born of nature bind the imperishable embodied self to the body, mighty-armed one.',
  'Of these, sattva, being pure, is illuminating and free from ill; it binds by attachment to happiness and attachment to knowledge, sinless one.',
  'Know rajas to be of the nature of passion, born of craving and attachment; it binds the embodied self, son of Kunti, by attachment to action.',
  'Know tamas to be born of ignorance, deluding all embodied beings; it binds, Bharata, by carelessness, laziness and sleep.',
  'Sattva attaches one to happiness, rajas to action, Bharata; tamas, veiling knowledge, attaches one to carelessness.',
  'Sattva prevails by overpowering rajas and tamas; rajas by overpowering sattva and tamas; and tamas by overpowering sattva and rajas.',
  'When light and knowledge shine through all the gates of the body, then know that sattva has grown.',
  'Greed, restless activity, taking up of works, unrest and longing arise when rajas grows, best of the Bharatas.',
  'Darkness, inertia, carelessness and delusion arise when tamas grows, joy of the Kurus.',
  'If the embodied one dies when sattva prevails, he goes to the pure worlds of those who know the highest.',
  'Dying in rajas, one is born among those attached to action; dying in tamas, one is born in deluded wombs.',
  'The fruit of good action is said to be sattvic and pure; the fruit of rajas is pain; the fruit of tamas is ignorance.',
  'From sattva arises knowledge, from rajas greed, and from tamas carelessness, delusion and ignorance.',
  'Those established in sattva rise upward; the rajasic stay in the middle; the tamasic, abiding in the lowest guna, go downward.',
  'When the seer sees no doer other than the gunas, and knows what is beyond the gunas, he attains my being.',
  'Going beyond these three gunas that give rise to the body, the embodied one, freed from birth, death, old age and sorrow, attains immortality.',
  'Arjuna said: Lord, by what marks is one known who has gone beyond these three gunas? How does he behave, and how does he go beyond them?',
  'The Lord said: Pandava, one who does not hate light, activity or delusion when they arise, nor long for them when they cease;',
  'who sits as if indifferent, unshaken by the gunas, knowing "it is only the gunas that move," and stays firm without wavering;',
  'the same in pain and pleasure, centred in the self, seeing a lump of earth, a stone and gold alike, equal towards the dear and the unpleasant, steady, the same in blame and praise;',
  'the same in honour and dishonour, the same towards friend and foe, giving up all selfish undertakings — such a one is said to have gone beyond the gunas.',
  'And one who serves me with unfailing yoga of devotion goes beyond these gunas and becomes fit to be one with Brahman.',
  'For I am the ground of Brahman, of the immortal and imperishable, of eternal dharma, and of absolute bliss.',
];
export const EN14: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
