import type { VerseEn } from '../types';

/** Bhagavad Gita chapter 15 — English meanings written for Divine Life. */
const T: string[] = [
  'The Lord said: They speak of the imperishable ashvattha tree with roots above and branches below, whose leaves are the Vedic hymns. One who knows it knows the Veda.',
  'Its branches spread below and above, nourished by the gunas, with sense objects as their shoots; and below, its roots stretch out, binding to action in the human world.',
  'Its true form is not perceived here, nor its end, beginning or foundation. Cutting down this firmly rooted ashvattha with the strong axe of non-attachment,',
  'one should then seek that goal from which, once reached, there is no return, saying: "I take refuge in that primal Person from whom the ancient flow of creation came forth."',
  'Free from pride and delusion, having conquered the fault of attachment, ever devoted to the self, desires turned away, freed from the opposites called pleasure and pain, the undeluded reach that imperishable goal.',
  'The sun does not illumine it, nor the moon, nor fire. Going there, none return. That is my supreme abode.',
  'An eternal part of me becomes a living being in the world of life, and draws to itself the senses, with the mind as the sixth, which rest in nature.',
  'When the Lord takes on a body and when he leaves it, he takes these along, as the wind carries scents from their source.',
  'Presiding over the ear, the eye, touch, taste and smell, and the mind, he enjoys the objects of the senses.',
  'The deluded do not see him departing, staying or enjoying, joined with the gunas; those with the eye of knowledge see.',
  'Striving yogis see him dwelling in the self; but the thoughtless whose minds are not prepared do not see him, even though they strive.',
  'The light in the sun that illumines the whole world, the light in the moon and in fire — know that light to be mine.',
  'Entering the earth, I sustain all beings by my energy; becoming the moon, full of sap, I nourish all plants.',
  'Becoming the fire of digestion in the bodies of living beings, joined with the in-breath and out-breath, I digest the four kinds of food.',
  'I am seated in the hearts of all; from me come memory, knowledge and their loss. I am the one to be known through all the Vedas; I am the author of the Vedanta and the knower of the Veda.',
  'There are two persons in this world, the perishable and the imperishable. All beings are perishable; the unchanging is called imperishable.',
  'But there is another, the highest Person, called the Supreme Self, the imperishable Lord who enters the three worlds and sustains them.',
  'Because I am beyond the perishable and higher even than the imperishable, I am celebrated in the world and in the Veda as the Supreme Person (Purushottama).',
  'One who, undeluded, knows me thus as the Supreme Person knows everything and worships me with his whole being, Bharata.',
  'Thus this most secret teaching has been told by me, sinless one. Knowing it, one becomes wise and has done all that is to be done, Bharata.',
];
export const EN15: Record<number, VerseEn> = Object.fromEntries(T.map((m, i) => [i + 1, { m }]));
