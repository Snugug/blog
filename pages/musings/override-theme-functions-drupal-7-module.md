---
title: Override Theme Functions from Drupal 7 Module
template: '_layout.html'
published: August 5, 2012
updated: August 5, 2012
summary: >
  Ever need to really override a core or contrib module's theme output? You won't believe what you can do with this one weird hook!
---
Have you ever really, truly hated the theme output of Drupal core or contrib module and really wanted to override it? In your theme function, it's easy enough, <php>function YOURTHEME_themename($vars)</php>. That's all fine and dandy, but what if you really want to do it from a module, like, say, if you're creating a [responsive image solution](http://drupal.org/project/borealis) and need to add a noscript fallback? Well, I can now tell you that yes you can! It's as simple as one overlooked hook and, well, writing you own function! Let's take a look at how.

This whole thing boils down to one hook, [<pre><code>hook_theme_registry_alter</code></pre>](http://api.drupal.org/api/drupal/modules%21system%21system.api.php/function/hook_theme_registry_alter/7). The hook is pretty simple, it goes a little something like this:

<pre><code class="language-php">/**
 * Implements hook_theme_registry_alter
 */
function mymodule__theme_registry_alter(&$theme_registry) {
  $theme_registry['theme_name']['theme path'] = 'path/to/your/module';
  $theme_registry['theme_name']['function'] = 'mymodule_function_name';
}</code></pre>

 <pre><code>'theme_name'</code></pre> is the name of the theme function you want to change, so if you wanted to alter the image style theme, you'd put <pre>'image_style'</pre> there. The theme path is the path to the module where the function is stored, but not the file itself, so you can plug in the output of [<pre><code>drupal_get_path()</code></pre>](http://api.drupal.org/api/drupal/includes%21common.inc/function/drupal_get_path/7) directly into it. All of the previous <pre>hook_preprocess</pre> and <pre>hook_process</pre> functions that are already written for the theme you're overriding will still work, so you can happily use this and be compatible with other modules!

A couple of things to note about your custom function. First, you don't need to write a full theme function to use this, just a plain old function will do as long as it takes the same input as the original function. Second, if you want to use the output of another theme function, especially, say, the one you're overriding so you can add to its output, you can call the function directly (in the case of image style, you can call <pre><code class="language-php">theme_image_style($vars)</code></pre>) and keep on going. And don't forget to return something!
