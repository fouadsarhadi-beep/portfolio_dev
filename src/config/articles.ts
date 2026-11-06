/** @module config/articles: long-form sample documents (articles), keyed by Sample.doc. @see src/config/documents.ts, src/ui/doc-viewer.ts, docs/DESIGN.md (Document reader) */
import type { SampleDocument } from './types';

/**
 * Bodies long enough to need headings, lists and a reading measure, kept apart
 * from the short entries in src/config/documents.ts so both data files stay
 * small. The reader resolves a key against this map first.
 * `html` is authored markup: trusted repo content, never user input.
 */
export const ARTICLES: Record<string, SampleDocument> = {
  'content-1': {
    kind: 'pdf',
    meta: '9 pages · 2026',
    html: `
      <p class="doc-lead">A service site answers the questions customers ask before they buy. This series turns the six most common ones into guides of 900 words each, one page per question, in the order a customer meets them.</p>
      <p>The six questions below came from three places: support tags, sales calls and search terms. Each source names the problem in the customer's own words, and that is the only version worth putting in a heading.</p>
      <h2>The six questions</h2>
      <p>The list stays at six. A seventh question usually means one of the six is too broad, so split it rather than add a page.</p>
      <ul>
        <li>What does this cost, and what changes after I pay?</li>
        <li>How long does setup take?</li>
        <li>Can I move the content I already have?</li>
        <li>Who fixes it when something breaks?</li>
        <li>Does it work with the tools I use now?</li>
        <li>What do I lose if I stop?</li>
      </ul>
      <h2>Where the questions come from</h2>
      <h3>Support tags</h3>
      <p>Support tags are free research. Export twelve months, group the tags that say the same thing, then count the groups. The top six become the series. This takes an afternoon and it replaces a month of guessing.</p>
      <h3>Sales calls</h3>
      <p>On a call, the second question is the honest one. The first question is polite, the second is the objection. Write those down and quote them back in the guide, because the reader asking it will recognize the phrasing.</p>
      <h3>Search terms</h3>
      <p>Search tells you the words, not the order. Use a term list to confirm a heading you already wrote, never to write it. A heading assembled from keywords reads like a keyword, and readers skip it.</p>
      <h2>The shape of one guide</h2>
      <p>Every guide keeps the same seven blocks, in the same order. The repetition is the point: a reader who has seen one guide knows where to look in the next.</p>
      <ol>
        <li>The answer in one sentence, above the fold.</li>
        <li>The steps, numbered, one action per step.</li>
        <li>What the reader needs before step one.</li>
        <li>A picture of the finished result.</li>
        <li>The cost, in numbers.</li>
        <li>The three questions readers send after reading.</li>
        <li>A link to the next guide in the series.</li>
      </ol>
      <p>When a guide breaks that order it stops matching the others, and the series loses the rhythm that made it useful.</p>
      <blockquote>The guide ends when the reader can act. Words after that point delay the action.</blockquote>
      <h2>Choosing a length</h2>
      <p>900 words is a target, not a rule. The number comes from reading time: at 200 words a minute, four and a half minutes is long enough to answer and short enough that people finish. Long guides collect bookmarks and no visits.</p>
      <p>Two guides can carry the same answer at very different lengths. The difference is what the reader must do before the answer applies.</p>
      <table>
        <thead><tr><th>Guide</th><th>Question</th><th>Words</th><th>First action</th></tr></thead>
        <tbody>
          <tr><td>Cost</td><td>What changes after I pay?</td><td>1,100</td><td>Compare two plans</td></tr>
          <tr><td>Setup</td><td>How long does setup take?</td><td>700</td><td>Open the settings page</td></tr>
          <tr><td>Migration</td><td>Can I move what I have?</td><td>1,400</td><td>Export the old content</td></tr>
        </tbody>
      </table>
      <p>The migration guide is the longest because the reader has work to do before the answer applies. <strong>Length follows the steps, never the keyword volume.</strong></p>
      <h2>Drafting one guide in a day</h2>
      <ol>
        <li>Write the answer in one sentence. If it needs two, the question is two questions.</li>
        <li>Write the steps from a recording of yourself doing the task.</li>
        <li>Add the screenshot at the moment the task succeeds.</li>
        <li>Read it aloud. Cut every sentence you stumble on.</li>
      </ol>
      <p>Drafting takes a day when the research is done. Research is the part people skip, and it is the reason most guides answer a question nobody asked.</p>
      <h2>Proof, and the number that moved</h2>
      <p>Every guide carries one number from your own data: a ticket count, a setup time, a migration that took two hours. <em>One</em> number is enough. A paragraph of praise is not proof, and readers treat it as filler.</p>
      <ul>
        <li>Quote the source, so the number can be checked.</li>
        <li>Keep the unit: hours, days, euros.</li>
        <li>Update the number when it changes, or drop the claim.</li>
      </ul>
      <h2>Keeping the series alive</h2>
      <h3>A calendar that fits</h3>
      <p>One guide a month covers six guides and a year of work. Name the file after its place in the series, <code>guide-03-migration.md</code>, so the order survives a folder move.</p>
      <p>Review the series twice a year. A guide that no longer matches the product is worse than a missing one, because it answers in the old words.</p>
      <hr>
      <h2>What to measure</h2>
      <p>Three numbers tell you whether the series works. Nothing else does.</p>
      <ol>
        <li>Tickets that repeat a guide's question, counted before and after.</li>
        <li>Readers who reach the last step, measured on the page.</li>
        <li>Sales calls where the customer quotes the guide.</li>
      </ol>
      <p>When the first number drops, the series is doing its job. The <a href="/work/seo/">search work</a> on the same site shows which question to write next.</p>
    `,
  },
  'content-2': {
    kind: 'doc',
    meta: '6 pages',
    html: `
      <p class="doc-lead">The old pages listed features in the order the team built them. The new pages follow the decision the customer makes: what the product does, what it costs, what changes after signup.</p>
      <h2>Four blocks, one action</h2>
      <p>Every page keeps the same four blocks, so a reader who has seen one page can scan the next one in half the time.</p>
      <ol>
        <li>What it does, in one sentence.</li>
        <li>The price, in numbers.</li>
        <li>What changes after signup.</li>
        <li>The next step, once.</li>
      </ol>
      <h3>Tone</h3>
      <p>Flat and concrete. Verbs instead of nouns, numbers instead of claims. <strong>No page needs the word "solution".</strong></p>
      <blockquote>The price belongs on the first screen. A reader who has to hunt for it leaves.</blockquote>`,
  },
};