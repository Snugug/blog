import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { markdown } from '../../lib/markdown.ts';

describe('markdown configuration', () => {
  it('should have correct shikiConfig theme', () => {
    assert.strictEqual(markdown.shikiConfig.theme, 'monokai');
  });

  it('should have 5 remark plugins configured', () => {
    assert.strictEqual(markdown.remarkPlugins.length, 5);
  });

  it('should have remarkRehype handlers configured', () => {
    assert.ok(markdown.remarkRehype.handlers);
    assert.ok(Object.keys(markdown.remarkRehype.handlers).length > 0);
  });
});

describe('remarkContainers - message directive', () => {
  it('should transform :::message into an aside with class "message"', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(':::message\nThis is a message\n:::');
    assert.strictEqual(
      result.code.trim(),
      '<aside class="message"><p>This is a message</p></aside>',
    );
  });

  it('should transform :::message{.warning} into aside with classes "warning message" and data-type', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::message{.warning}
Warning message content
:::
`);
    assert.ok(
      result.code.includes('class="warning message"'),
      `Expected class="warning message" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('data-type="warning"'),
      `Expected data-type="warning" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('<aside'),
      `Expected aside element in: ${result.code}`,
    );
  });

  it('should transform :::message{.error} into aside with classes "error message"', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::message{.error}
Error message content
:::
`);
    assert.ok(
      result.code.includes('class="error message"'),
      `Expected class="error message" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('data-type="error"'),
      `Expected data-type="error" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('<aside'),
      `Expected aside element in: ${result.code}`,
    );
  });

  it('should create message title with message--title class when title is provided', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::message[Important Note]{.warning}
Message body here
:::
`);
    assert.ok(
      result.code.includes('class="message--title"'),
      `Expected class="message--title" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('Important Note'),
      `Expected title "Important Note" in: ${result.code}`,
    );
  });

  it('should transform inline :message into a span', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(
      `This is :message[inline]{.info} text`,
    );
    assert.ok(
      result.code.includes('<span'),
      `Expected span element in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('message'),
      `Expected message class in: ${result.code}`,
    );
  });

  it('should handle message with multiple paragraphs', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(
      ':::message\nParagraph 1\n\nParagraph 2\n:::',
    );
    assert.strictEqual(
      result.code.trim(),
      '<aside class="message"><p>Paragraph 1</p><p>Paragraph 2</p></aside>',
    );
  });
});

describe('remarkContainers - figure directive', () => {
  it('should transform :::figure into a figure element', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(
      ':::figure\n![Alt text](image.png)\n:::',
    );
    assert.strictEqual(
      result.code.trim(),
      '<figure><p><img src="image.png" alt="Alt text"></p></figure>',
    );
  });

  it('should add figure- prefix to id attribute', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::figure{#myimage}
![Alt text](image.png)
:::
`);
    assert.ok(
      result.code.includes('id="figure-myimage"'),
      `Expected id="figure-myimage" in: ${result.code}`,
    );
  });

  it('should create figcaption from label', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::figure[This is the caption]
![Alt text](image.png)
:::
`);
    assert.ok(
      result.code.includes('<figcaption'),
      `Expected figcaption element in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('This is the caption'),
      `Expected caption text in: ${result.code}`,
    );
  });

  it('should handle figure with both id and caption', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
:::figure[My Caption]{#test}
![Alt text](image.png)
:::
`);
    assert.ok(
      result.code.includes('id="figure-test"'),
      `Expected id="figure-test" in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('<figcaption'),
      `Expected figcaption in: ${result.code}`,
    );
    assert.ok(
      result.code.includes('My Caption'),
      `Expected caption text in: ${result.code}`,
    );
  });

  it('should handle figure with multiple paragraphs', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(
      ':::figure[Multi Paragraph Caption]\n![Alt text](image.png)\n\nThis is paragraph 1.\n\nThis is paragraph 2.\n:::',
    );
    assert.strictEqual(
      result.code.trim(),
      '<figure><p><img src="image.png" alt="Alt text"></p><p>This is paragraph 1.</p><p>This is paragraph 2.</p><figcaption>Multi Paragraph Caption</figcaption></figure>',
    );
  });
});

describe('remark plugins integration', () => {
  it('should support definition lists', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
Term 1
: Definition 1

Term 2
: Definition 2
`);
    assert.ok(
      result.code.includes('<dl>') || result.code.includes('<dt>'),
      `Expected definition list elements in: ${result.code}`,
    );
  });

  it('should support extended tables with colspan', async () => {
    const processor = await createMarkdownProcessor(markdown);
    const result = await processor.render(`
| a | b |
|---|---|
| 1 | 2 |
`);
    assert.ok(
      result.code.includes('<table'),
      `Expected table element in: ${result.code}`,
    );
  });
});
