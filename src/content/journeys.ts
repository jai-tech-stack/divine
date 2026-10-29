import { stories } from './index';

export function storiesForBook(id: string) {
  const reviewed = stories.filter(story => story.sourceReviewed === true);
  if (id === 'nayanmar-stories' || id === 'periyapuranam') return reviewed.filter(story => /நாயன்மார்|பெரிய\s*புராணம்/.test(story.purana));
  if (id === 'eighteen-puranas') return reviewed.filter(story => !/நாயன்மார்|பெரிய\s*புராணம்/.test(story.purana));
  if (id === 'bhagavata-puranam') return reviewed.filter(story => /பாகவத/.test(story.purana));
  if (id === 'chakravarthi-thirumagan') return reviewed.filter(story => /ராமாயண/.test(story.purana));
  return [];
}
