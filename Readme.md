# AI Scripts

Literally just a bunch of scripts that are potentially useful. There isn't much yet, but I'm thinking this will build up over time.

## Scripts

### Blogger

Blogger is a little script that interfaces with ChatGPT in order to create a blog post. Run it by going to the directory:

```bash
cd blogger
```

and then running the script

```bash
npm run start
```

This will open up a little CLI where you will be asked what the title of your blog post should be. You also might want to retry certain articles, which is also possible thanks to them being tracked in the `blogger/data/history.json` file. If you would like to retry, simply select that option from the menu, and then paste the article id when prompted.

The script will take your title, as well as some other predefined options in your `blogger/config.json` file, and prompt the ChatGPT API to create a blog post for you. It will then save the article to the `blogger/articles` directory, and add the article to the `blogger/data/history.json` file.

Some current config options are:

```json
{
  "initial_prompt": "Here you can define the system message that will define how ChatGPT should behave.",
  "ideal_reader": {
    "description": "A description of the ideal reader for your blog posts."
  },
  "author": {
    "name": "Your name"
  },
  "default_tags": ["tag1", "tag2", "tag3"], // Tags to be added to your blog posts if they're not generated automatically
  "article_min_length": { // The minimum length of your blog posts
    "value": 1000,
    "unit": "words"
  },
  "article_max_length": { // The maximum length of your blog posts
    "value": 2000,
    "unit": "words"
  }
}
```
