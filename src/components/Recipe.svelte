<script>
  import { createMarkdownProcessor } from '@astrojs/markdown-remark';
  import { markdown } from '$lib/markdown';

  let { instructions } = $props();

  const md = await createMarkdownProcessor(markdown);

  const i = await Promise.all(
    instructions.map(async (ins) => {
      const procedure = await Promise.all(
        ins.procedure.map(async (step) => (await md.render(step)).code),
      );
      ins.procedure = procedure;

      return ins;
    }),
  );
</script>

<div class="container" />
<table class="recipe">
  <thead>
    <tr>
      <th id="ingredient">Ingredient</th>
      <th id="amount">Amount</th>
      <th id="procedure">Procedure</th>
    </tr>
  </thead>
  <tbody class="recipe--instructions">
    {#each i as instruction}
      <tr>
        <td colspan="3" class="recipe--timing">
          <span class="recipe--active">
            Active: {instruction.time.active}
          </span>
          {#if instruction.time.inactive}
            <span class="recipe--inactive">
              | Inactive: {instruction.time.inactive}
            </span>
          {/if}
          {#if instruction.time.rest}
            <span class="recipe--rest">
              | Rest: {instruction.time.rest}
            </span>
          {/if}
        </td>
      </tr>
      <tr class="recipe--row">
        <td colspan="2">
          <table class="recipe--ingredients">
            <tbody>
              {#each instruction.ingredients as ingredient}
                <tr itemprop="recipeIngredient">
                  <td aria-labelledby="ingredient">{ingredient.name}</td>
                  <td aria-labelledby="amount">{ingredient.amount}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </td>
        <td>
          <ol class="recipe--steps" itemprop="recipeInstructions">
            {#each instruction.procedure as step}
              <li class="type">{@html step}</li>
            {/each}
          </ol>
        </td>
      </tr>
    {/each}
  </tbody>
</table>

<style lang="scss">
  .recipe {
    border-collapse: collapse;
    counter-reset: steps;
    width: 100%;

    @media (max-width: 500px) {
      font-size: 0.8em;
    }

    th {
      border-bottom: 3px solid var(--red);
      padding: 0 0.25rem;
      padding-bottom: 0.25rem;
      text-transform: uppercase;

      &:first-of-type {
        padding-left: 0;
      }

      &:last-of-type {
        padding-right: 0;
      }
    }

    tr {
      padding: var(--spacing);
    }

    &--ingredients {
      width: 100%;

      td:first-of-type {
        padding-right: 0.25rem;
        width: 60%;
      }

      td:last-of-type {
        padding: 0 0.25rem;
      }
    }

    &--instructions {
      /* stylelint-disable max-nesting-depth */
      > tr:nth-of-type(odd) {
        &:first-of-type {
          > td {
            padding-bottom: 0.5rem;
            padding-top: 0.5rem;
          }
        }

        &:not(:first-of-type) {
          border-top: 1px solid var(--white);

          > td {
            padding-bottom: 0.5rem;
            padding-top: 0.5rem;
          }
        }
      }

      > tr:nth-of-type(even):not(:last-of-type) {
        > td {
          padding-bottom: 0.75rem;
        }
      }
      /* stylelint-enable max-nesting-depth */
    }

    &--instructions &--timing {
      font-size: 0.8rem;
      text-align: right;
    }

    &--steps {
      margin-left: 2em;

      li {
        counter-increment: steps;
        position: relative;

        &:not(:first-of-type) {
          margin-top: 1rem;
        }

        &::before {
          align-items: center;
          border: 1px solid var(--white);
          border-radius: 50%;
          content: counter(steps);
          display: flex;
          font-size: 0.75rem;
          height: 1.5rem;
          justify-content: center;
          left: -1.75rem;
          padding: 0.8em;
          position: absolute;
          width: 1.5rem;
        }
      }
    }
  }

  [itemprop='step'] {
    padding-left: 0.25rem;
  }

  /* stylelint-disable selector-max-id */
  #ingredient {
    width: 30%;
  }

  #amount {
    width: 20%;
  }
  /* stylelint-enable selector-max-id */

  .type {
    line-height: initial;
  }
</style>
