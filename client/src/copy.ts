import type { Lang } from '../../shared/types';

type Pool = Record<Lang, string[]>;

export const FIRST_TREE_LINE: Record<Lang, string> = {
  en: 'The cremation ground outside Ujjain. A corpse hangs upside down from the peepal tree, and it is grinning at you.',
  odia: 'ପୁରୀର ସ୍ୱର୍ଗଦ୍ୱାର ଶ୍ମଶାନ। ଓସ୍ତ ଗଛରୁ ଗୋଟିଏ ଶବ ଓଲଟା ହୋଇ ଝୁଲୁଛି, ଆଉ ତୁମକୁ ଦେଖି ହସୁଛି।',
  'odia-roman': 'Puri ra Swargadwar shmashana. Osta gachharu gote shaba olata hoi jhuluchhi, au tumaku dekhi hasuchhi.',
};

export const TREE_LINES: Pool = {
  en: [
    'Betaal hangs upside down from the peepal tree again, humming to himself.',
    'The peepal leaves rustle. Betaal is back on his branch, grinning at you upside down.',
    'You walk back through the ashes. Betaal waves lazily from his branch.',
    'An owl calls twice. Betaal swings from the tree as if nothing happened.',
    'The pyre crackles. Up on his branch, Betaal pretends to be asleep.',
    'Betaal dangles from the peepal tree, counting the stars out loud.',
  ],
  odia: [
    'ବେତାଳ ପୁଣି ଓସ୍ତ ଗଛରେ ଓଲଟା ଝୁଲୁଛି, କିଛି ଗୁଣୁଗୁଣୁ ହେଉଛି।',
    'ଓସ୍ତ ପତ୍ର ସରସର ହେଉଛି। ବେତାଳ ନିଜ ଡାଳରେ ଫେରିଛି, ଓଲଟା ଝୁଲି ତୁମକୁ ଦେଖି ହସୁଛି।',
    'ପାଉଁଶ ଭିତରେ ତୁମେ ପୁଣି ଫେରି ଚାଲିଲ। ବେତାଳ ଡାଳରୁ ଅଳସରେ ହାତ ହଲାଉଛି।',
    'ଗୋଟିଏ ପେଚା ଦୁଇଥର ଡାକିଲା। ବେତାଳ ଏମିତି ଝୁଲୁଛି ଯେମିତି କିଛି ହୋଇନି।',
    'ଚିତା ଚଡ଼ଚଡ଼ ହେଉଛି। ଉପର ଡାଳରେ ବେତାଳ ଶୋଇବାର ଅଭିନୟ କରୁଛି।',
    'ସମୁଦ୍ରର ଗର୍ଜନ ଭିତରେ ବେତାଳ ଓସ୍ତ ଗଛରୁ ଝୁଲି ଜୋରରେ ତାରା ଗଣୁଛି।',
  ],
  'odia-roman': [
    'Betaal puni osta gachhare olata jhuluchhi, kichhi gunugunu heuchhi.',
    'Osta patra sarasara heuchhi. Betaal nija daalare pherichhi, olata jhuli tumaku dekhi hasuchhi.',
    'Paunsha bhitare tume puni pheri chalila. Betaal daalaru alasare hata halauchhi.',
    'Gote pecha duithara dakila. Betaal emiti jhuluchhi jemiti kichhi hoini.',
    'Chita chadachada heuchhi. Upara daalare Betaal shoibara abhinaya karuchhi.',
    'Samudrara garjana bhitare Betaal osta gachharu jhuli jorare tara ganuchhi.',
  ],
};

export const TELLING_LINES: Pool = {
  en: [
    'Betaal settles on your shoulder and clears his throat…',
    'Cold fingers drum on your crown. A tale is coming…',
    'Betaal cackles into your ear and begins…',
    'The ghost leans close. His breath smells of ash and jasmine…',
  ],
  odia: [
    'ବେତାଳ ତୁମ କାନ୍ଧରେ ଜମି ବସିଲା ଓ ଗଳା ସଫା କଲା…',
    'ଥଣ୍ଡା ଆଙ୍ଗୁଠି ତୁମ ମୁକୁଟରେ ଠକ୍ ଠକ୍ କରୁଛି। ଗପ ଆସୁଛି…',
    'ବେତାଳ ତୁମ କାନରେ ଖିଲିଖିଲି ହସି ଆରମ୍ଭ କଲା…',
    'ଭୂତ ପାଖକୁ ନଇଁ ଆସିଲା। ତା ନିଶ୍ୱାସରେ ପାଉଁଶ ଆଉ ମଲ୍ଲୀ ଫୁଲର ବାସ୍ନା…',
  ],
  'odia-roman': [
    'Betaal tuma kandhare jami basila o gala sapha kala…',
    'Thanda aanguthi tuma mukutare thak thak karuchhi. Gapa asuchhi…',
    'Betaal tuma kanare khilikhili hasi arambha kala…',
    'Bhuta pakhaku nain asila. Ta nishwasare paunsha au malli phulara basna…',
  ],
};

export const JUDGING_LINES: Pool = {
  en: [
    'Betaal goes quiet and weighs your words…',
    'You can feel Betaal grinning behind your ear…',
    'The peepal leaves stop rustling. Betaal is thinking…',
    'Betaal hums an old funeral song while he decides…',
  ],
  odia: [
    'ବେତାଳ ଚୁପ୍ ହୋଇ ତୁମ କଥାକୁ ତଉଲୁଛି…',
    'କାନ ପଛରେ ବେତାଳର ହସ ଅନୁଭବ ହେଉଛି…',
    'ଓସ୍ତ ପତ୍ର ସ୍ଥିର ହୋଇଗଲା। ବେତାଳ ଭାବୁଛି…',
    'ବେତାଳ ବିଚାର କରୁ କରୁ ଗୋଟିଏ ପୁରୁଣା ଗୀତ ଗୁଣୁଗୁଣୁ କରୁଛି…',
  ],
  'odia-roman': [
    'Betaal chup hoi tuma kathaku tauluchhi…',
    'Kana pachhare Betaal ra hasa anubhaba heuchhi…',
    'Osta patra sthira hoigala. Betaal bhabuchhi…',
    'Betaal bichara karu karu gote purana gita gunugunu karuchhi…',
  ],
};

export const SILENT_LINE: Record<Lang, string> = {
  en: '(You press your lips together and say nothing.)',
  odia: '(ତୁମେ ଓଠ ଚାପି ଚୁପ୍ ରହିଲ।)',
  'odia-roman': '(Tume otha chapi chup rahila.)',
};

export const LAUGH: Record<Lang, string> = { en: 'Ha ha ha!', odia: 'ହା ହା ହା!', 'odia-roman': 'Ha ha ha!' };

export const PAINTING_NOTE: Record<'painting' | 'failed', Record<Lang, string>> = {
  painting: {
    en: 'Betaal is painting the tale…',
    odia: 'ବେତାଳ ଗପଟିକୁ ପଟ୍ଟଚିତ୍ରରେ ଆଙ୍କୁଛି…',
    'odia-roman': 'Betaal gapatiku pattachitrare ankuchhi…',
  },
  failed: {
    en: 'The painting faded, but the tale goes on.',
    odia: 'ଚିତ୍ର ଲିଭିଗଲା, କିନ୍ତୁ ଗପ ଚାଲିଛି।',
    'odia-roman': 'Chitra libhigala, kintu gapa chaluchhi.',
  },
};

/** Deals lines like cards: none repeats until the whole pool has been used. */
export class Deck {
  private left = new Map<string[], string[]>();

  draw(pool: string[]): string {
    let cards = this.left.get(pool);
    if (!cards?.length) {
      cards = [...pool].sort(() => Math.random() - 0.5);
      this.left.set(pool, cards);
    }
    return cards.pop()!;
  }
}
