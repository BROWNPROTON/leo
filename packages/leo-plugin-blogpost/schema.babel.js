import graphql, {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList
} from 'graphql/type';

import find from 'lodash/find';
import take from 'lodash/take';
import filter from 'lodash/filter';
import oDebug from 'debug';
import moment from 'moment';
const debug = oDebug('leo:plugin-blogpost:schema');

const BlogPostAttributesType = new GraphQLObjectType({
  name: 'BlogPostAttributes',
  fields: {
    title: {
      type: GraphQLString,
      description: 'Display title for the BlogPost'
    },
    slug: {
      type: GraphQLString,
      description: 'url-safe string for use in URLs. Can be derived from Title, Filename or specified in Frontmatter'
    },
    date: {
      type: GraphQLString,
      description: 'The most recent time that this BlogPost was updated, in moment-parseable format'
    },
    featuredImage: {
      type: GraphQLString,
      description: 'Featured image for display in Heros and Previews'
    },
    url: {
      type: GraphQLString,
      description: 'The absolute pathname of the BlogPost, ex. `/post`'
    },
    excerpt: {
      type: GraphQLString,
      description: 'A short excerpt of the `body` content'
    },
    timeToRead: {
      type: GraphQLInt,
      description: 'The time it takes the average person to read this post in minutes'
    }
  }
})

const BlogPostType = new GraphQLObjectType({
  name: 'BlogPost',
  description: 'A Blog Post written in Markdown with Frontmatter.',
  fields: {
    attributes: {
      type: BlogPostAttributesType,
      description: 'Metadata about the blog post'
    },
    rawBody: {
      type: GraphQLString,
      description: 'The raw Markdown, excluding any frontmatter'
    },
    body: {
      type: GraphQLString,
      description: 'The Markdown rendered as HTML'
    }
  }
})

module.exports = function(data) {

  const getPost = (slug) => {
    const post = find(data, ({ attributes: a }) => {
      if(a) {
        return a.contentType === 'leo-blogpost' && a.slug === slug;
      } else {
        return false;
      }
    });
    if(!post) {
      console.log('leo-plugin-blogpost could not find', slug);
    }
    return post
  }

  const getAllPosts = ({ limit=5 }) => {
    // return up to `limit` blogposts
    return take(filter(data, ({ attributes: a }) => {
      return a.contentType === 'leo-blogpost';
    }).sort((postA, postB) => {
      // sort newest first
      return !moment.utc(postA.date).isAfter(postB.date)
    }), limit);
  }
  
  return {
    post: {
      type: BlogPostType,
      args: {
        slug: {
          type: GraphQLString,
          description: 'The slugified version of a post title'
        }
      },
      resolve: (root, {
        slug
      }) => getPost(slug)
    },
    allPosts: {
      type: new GraphQLList(BlogPostType),
      args: {
        limit: {
          type: GraphQLInt,
          description: 'Restrict the number of results'
        }
      },
      resolve: (_, args) => getAllPosts(args)
    }
  }
}